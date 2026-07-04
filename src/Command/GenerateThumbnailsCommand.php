<?php

namespace App\Command;

use App\Entity\Photo;
use App\Service\ImageOptimizer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Génère (ou régénère) les miniatures de toutes les photos existantes.
 *
 * Usage :  php bin/console app:generate-thumbnails
 */
class GenerateThumbnailsCommand extends Command
{
    protected static $defaultName = 'app:generate-thumbnails';

    private EntityManagerInterface $em;
    private ImageOptimizer $imageOptimizer;
    private string $photosDirectory;

    public function __construct(
        EntityManagerInterface $em,
        ImageOptimizer $imageOptimizer,
        string $photosDirectory
    ) {
        parent::__construct();
        $this->em = $em;
        $this->imageOptimizer = $imageOptimizer;
        $this->photosDirectory = $photosDirectory;
    }

    protected function configure(): void
    {
        $this->setDescription('Compresse les originaux et génère les miniatures des photos existantes.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $photos = $this->em->getRepository(Photo::class)->findAll();
        $total = \count($photos);

        if ($total === 0) {
            $io->success('Aucune photo à traiter.');
            return Command::SUCCESS;
        }

        $io->progressStart($total);
        $done = 0;
        $missing = 0;

        foreach ($photos as $photo) {
            $album = $photo->getAlbum();
            if ($album === null || $album->getCreator() === null) {
                $io->progressAdvance();
                continue;
            }

            $path = $this->photosDirectory
                . '/' . $album->getCreator()->getId()
                . '/' . $album->getNomAlbum()
                . '/' . $photo->getFilePath();

            if (is_file($path)) {
                $this->imageOptimizer->generateThumbnail($path);
                $done++;
            } else {
                $missing++;
            }

            $io->progressAdvance();
        }

        $io->progressFinish();
        $io->success(sprintf('%d miniature(s) générée(s). %d fichier(s) introuvable(s).', $done, $missing));

        return Command::SUCCESS;
    }
}
