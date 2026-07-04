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
 * REPRENABLE : les photos ayant déjà une miniature sont ignorées, donc si la page
 * expire (timeout PHP sur beaucoup de photos), il suffit de la recharger pour continuer.
 */
class ThumbnailController extends AbstractController
{
    /**
     * @Route("/admin/generate-thumbnails", name="admin_generate_thumbnails")
     */
    public function generate(EntityManagerInterface $em, ImageOptimizer $imageOptimizer): Response
    {
        // Sécurité : réservé au super-admin.
        $this->denyAccessUnlessGranted('ROLE_SUPER_ADMIN');

        // Meilleur effort pour éviter un timeout PHP (peut être plafonné par l'hébergeur).
        @set_time_limit(0);

        $photosDirectory = $this->getParameter('photos_directory');
        $photos = $em->getRepository(Photo::class)->findAll();

        $created = 0;
        $skipped = 0;
        $missing = 0;

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

            // Reprenable : on saute celles qui ont déjà une miniature.
            if ($imageOptimizer->thumbnailExists($originalPath)) {
                $skipped++;
                continue;
            }

            $imageOptimizer->generateThumbnail($originalPath);
            $created++;
        }

        $total = \count($photos);
        $remaining = $total - $created - $skipped - $missing;

        $html = sprintf(
            '<div style="font-family:sans-serif;max-width:640px;margin:40px auto;line-height:1.6">'
            . '<h1>Génération des miniatures</h1>'
            . '<ul>'
            . '<li><strong>%d</strong> miniature(s) créée(s) cette fois</li>'
            . '<li><strong>%d</strong> déjà présente(s) (ignorée(s))</li>'
            . '<li><strong>%d</strong> fichier(s) original/aux introuvable(s)</li>'
            . '<li><strong>%d</strong> photo(s) au total</li>'
            . '</ul>'
            . '<p style="color:#155724;background:#d4edda;padding:12px;border-radius:6px">'
            . 'Les photos originales n\'ont pas été modifiées : seules des miniatures ont été ajoutées.'
            . '</p>'
            . '%s'
            . '</div>',
            $created,
            $skipped,
            $missing,
            $total,
            $created > 0
                ? '<p><a href="' . $this->generateUrl('admin_generate_thumbnails') . '">Relancer</a> '
                  . 'pour traiter le reste si la page a expiré avant la fin.</p>'
                : '<p><strong>Terminé :</strong> toutes les miniatures existantes sont à jour.</p>'
        );

        return new Response($html);
    }
}
