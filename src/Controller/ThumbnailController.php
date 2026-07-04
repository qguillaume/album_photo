<?php

namespace App\Controller;

use App\Entity\Photo;
use App\Service\ImageOptimizer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Génération des miniatures des photos existantes, déclenchable depuis le navigateur
 * (utile quand on n'a pas d'accès SSH/console sur l'hébergement).
 *
 * ⚠️ NON-DESTRUCTIF : ne crée que les fichiers "thumbnails/", ne touche jamais aux originaux.
 *
 * ROBUSTE POUR HÉBERGEMENT MUTUALISÉ :
 *   - traite les photos par PETITS PAQUETS (pour ne pas dépasser le temps/mémoire) ;
 *   - la page se RECHARGE toute seule tant qu'il reste des miniatures à créer ;
 *   - les images trop volumineuses pour la mémoire sont IGNORÉES (pas de plantage) ;
 *   - toute erreur inattendue est AFFICHÉE sur la page (pas de "500" opaque).
 */
class ThumbnailController extends AbstractController
{
    /** Nombre de miniatures créées par requête (avant rechargement auto). */
    private const BATCH_SIZE = 8;

    /**
     * @Route("/admin/generate-thumbnails", name="admin_generate_thumbnails")
     */
    public function generate(EntityManagerInterface $em, ImageOptimizer $imageOptimizer): Response
    {
        $this->denyAccessUnlessGranted('ROLE_SUPER_ADMIN');

        // Meilleur effort pour desserrer les limites (peut être ignoré par l'hébergeur).
        @ini_set('memory_limit', '512M');
        @set_time_limit(60);

        $photosDirectory = $this->getParameter('photos_directory');
        $photos = $em->getRepository(Photo::class)->findAll();

        $alreadyDone = 0;   // miniatures déjà présentes
        $missing = 0;       // fichier original introuvable
        $toProcess = [];    // originaux sans miniature

        foreach ($photos as $photo) {
            $album = $photo->getAlbum();
            if ($album === null || $album->getCreator() === null) {
                continue;
            }

            $originalPath = $photosDirectory
                . '/' . $album->getCreator()->getId()
                . '/' . $album->getNomAlbum()
                . '/' . $photo->getFilePath();

            if (!is_file($originalPath)) {
                $missing++;
                continue;
            }

            if ($imageOptimizer->thumbnailExists($originalPath)) {
                $alreadyDone++;
                continue;
            }

            $toProcess[] = $originalPath;
        }

        $created = 0;   // miniatures créées lors de CETTE requête
        $skipped = 0;   // ignorées (trop volumineuses / illisibles)
        $errorMessage = null;

        try {
            foreach ($toProcess as $originalPath) {
                if ($created >= self::BATCH_SIZE) {
                    break; // Le reste sera traité au prochain rechargement.
                }

                if ($imageOptimizer->generateThumbnail($originalPath)) {
                    $created++;
                } else {
                    $skipped++; // Ignorée sans risque, ne bloque pas la boucle.
                }
            }
        } catch (\Throwable $e) {
            // On affiche l'erreur au super-admin au lieu d'un "500" opaque.
            $errorMessage = $e->getMessage();
        }

        // Reste à faire = originaux sans miniature non encore créés ni ignorés cette fois.
        $remaining = \count($toProcess) - $created - $skipped;
        $finished = ($remaining <= 0);

        return new Response($this->renderPage(
            $created,
            $alreadyDone,
            $skipped,
            $missing,
            $remaining,
            $finished,
            $errorMessage
        ));
    }

    private function renderPage(
        int $created,
        int $alreadyDone,
        int $skipped,
        int $missing,
        int $remaining,
        bool $finished,
        ?string $errorMessage
    ): string {
        // Rechargement auto tant qu'il reste du travail ET qu'il n'y a pas d'erreur.
        $autoRefresh = (!$finished && $errorMessage === null)
            ? '<meta http-equiv="refresh" content="1">'
            : '';

        $url = $this->generateUrl('admin_generate_thumbnails');

        if ($errorMessage !== null) {
            $status = '<p style="color:#721c24;background:#f8d7da;padding:12px;border-radius:6px">'
                . '<strong>Erreur :</strong> ' . htmlspecialchars($errorMessage)
                . '</p><p><a href="' . $url . '">Réessayer</a></p>';
        } elseif ($finished) {
            $status = '<p style="color:#155724;background:#d4edda;padding:12px;border-radius:6px">'
                . '<strong>Terminé !</strong> Toutes les miniatures possibles ont été générées.'
                . ($skipped > 0
                    ? ' ' . $skipped . ' image(s) trop volumineuse(s) ont été laissée(s) en pleine résolution.'
                    : '')
                . '</p>';
        } else {
            $status = '<p style="color:#004085;background:#cce5ff;padding:12px;border-radius:6px">'
                . 'Traitement en cours… la page se recharge automatiquement. '
                . '<strong>' . $remaining . '</strong> photo(s) restante(s). '
                . 'Ne ferme pas cet onglet. '
                . '(Si le rechargement s\'arrête, clique <a href="' . $url . '">ici</a>.)'
                . '</p>';
        }

        return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">'
            . $autoRefresh
            . '<title>Génération des miniatures</title></head>'
            . '<body style="font-family:sans-serif;max-width:640px;margin:40px auto;line-height:1.6">'
            . '<h1>Génération des miniatures</h1>'
            . $status
            . '<ul>'
            . '<li><strong>' . $created . '</strong> créée(s) à cette étape</li>'
            . '<li><strong>' . $alreadyDone . '</strong> déjà présente(s)</li>'
            . '<li><strong>' . $skipped . '</strong> ignorée(s) cette étape (trop volumineuse / illisible)</li>'
            . '<li><strong>' . $missing . '</strong> original(aux) introuvable(s)</li>'
            . '</ul>'
            . '<p style="color:#155724">Les photos originales ne sont jamais modifiées : seules des miniatures sont ajoutées.</p>'
            . '</body></html>';
    }
}
