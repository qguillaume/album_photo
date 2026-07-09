<?php

namespace App\Controller;

use App\Entity\Photo;
use App\Service\ImageOptimizer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
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
 *
 * MODE FORCE (?force=1) : régénère TOUTES les miniatures, même existantes.
 * À utiliser une fois après la correction d'orientation EXIF, pour remplacer
 * les anciennes miniatures générées sans correction (photos qui apparaissaient
 * pivotées dans les grilles). Avance avec un curseur ?offset=N pour ne jamais
 * retraiter deux fois les mêmes photos entre deux rechargements.
 */
class ThumbnailController extends AbstractController
{
    /** Nombre de miniatures créées par requête (avant rechargement auto). */
    private const BATCH_SIZE = 8;

    #[Route('/admin/generate-thumbnails', name: 'admin_generate_thumbnails')]
    public function generate(Request $request, EntityManagerInterface $em, ImageOptimizer $imageOptimizer): Response
    {
        $this->denyAccessUnlessGranted('ROLE_SUPER_ADMIN');

        // Meilleur effort pour desserrer les limites (peut être ignoré par l'hébergeur).
        @ini_set('memory_limit', '512M');
        @set_time_limit(60);

        // Mode force : régénère TOUT (remplace les anciennes miniatures sans
        // correction EXIF). Le curseur ?offset garantit une progression stricte.
        $force = $request->query->getBoolean('force');
        $offset = max(0, $request->query->getInt('offset'));

        $photosDirectory = $this->getParameter('photos_directory');
        // Ordre stable (id croissant) : indispensable pour que le curseur
        // du mode force pointe toujours sur les mêmes photos entre deux requêtes.
        $photos = $em->getRepository(Photo::class)->findBy([], ['id' => 'ASC']);

        $alreadyDone = 0;   // miniatures déjà présentes (mode normal uniquement)
        $missing = 0;       // fichier original introuvable
        $toProcess = [];    // originaux à traiter

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

            if (!$force && $imageOptimizer->thumbnailExists($originalPath)) {
                $alreadyDone++;
                continue;
            }

            $toProcess[] = $originalPath;
        }

        // En mode force, on reprend là où le rechargement précédent s'est arrêté.
        $totalToProcess = \count($toProcess);
        if ($force) {
            $toProcess = \array_slice($toProcess, $offset);
        }

        $created = 0;   // miniatures (re)créées lors de CETTE requête
        $skipped = 0;   // ignorées (trop volumineuses / illisibles)
        $errorMessage = null;

        try {
            foreach ($toProcess as $originalPath) {
                if ($created + $skipped >= self::BATCH_SIZE) {
                    break; // Le reste sera traité au prochain rechargement.
                }

                if ($force) {
                    // Supprimer l'ancienne miniature pour la régénérer proprement.
                    $oldThumb = $imageOptimizer->thumbnailPathFor($originalPath);
                    if (is_file($oldThumb)) {
                        @unlink($oldThumb);
                    }
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

        $processed = $created + $skipped;

        if ($force) {
            $remaining = $totalToProcess - $offset - $processed;
            $nextUrl = $this->generateUrl('admin_generate_thumbnails')
                . '?force=1&offset=' . ($offset + $processed);
        } else {
            $remaining = \count($toProcess) - $processed;
            $nextUrl = $this->generateUrl('admin_generate_thumbnails');
        }
        $finished = ($remaining <= 0);

        return new Response($this->renderPage(
            $created,
            $alreadyDone,
            $skipped,
            $missing,
            $remaining,
            $finished,
            $errorMessage,
            $nextUrl,
            $force
        ));
    }

    private function renderPage(
        int $created,
        int $alreadyDone,
        int $skipped,
        int $missing,
        int $remaining,
        bool $finished,
        ?string $errorMessage,
        ?string $nextUrl = null,
        bool $force = false
    ): string {
        $url = $nextUrl ?? $this->generateUrl('admin_generate_thumbnails');

        // Rechargement auto (vers l'URL de reprise) tant qu'il reste du travail
        // ET qu'il n'y a pas d'erreur.
        $autoRefresh = (!$finished && $errorMessage === null)
            ? '<meta http-equiv="refresh" content="1;url=' . htmlspecialchars($url) . '">'
            : '';

        if ($errorMessage !== null) {
            $status = '<p style="color:#721c24;background:#f8d7da;padding:12px;border-radius:6px">'
                . '<strong>Erreur :</strong> ' . htmlspecialchars($errorMessage)
                . '</p><p><a href="' . $url . '">Réessayer</a></p>';
        } elseif ($finished) {
            $forceUrl = $this->generateUrl('admin_generate_thumbnails') . '?force=1';
            $status = '<p style="color:#155724;background:#d4edda;padding:12px;border-radius:6px">'
                . '<strong>Terminé !</strong> Toutes les miniatures possibles ont été générées.'
                . ($skipped > 0
                    ? ' ' . $skipped . ' image(s) trop volumineuse(s) ont été laissée(s) en pleine résolution.'
                    : '')
                . '</p>'
                . ($force
                    ? ''
                    : '<p style="color:#856404;background:#fff3cd;padding:12px;border-radius:6px">'
                        . 'Des photos apparaissent pivotées dans les grilles alors qu\'elles sont droites ailleurs ? '
                        . '<a href="' . $forceUrl . '">Régénérer TOUTES les miniatures</a> '
                        . '(applique la correction d\'orientation EXIF aux anciennes miniatures ; les originaux ne sont pas modifiés).'
                        . '</p>');
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
