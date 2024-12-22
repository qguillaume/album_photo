<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241221234648 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // Cette méthode est utilisée pour appliquer les changements
        $this->addSql('ALTER TABLE album ADD image_path VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // Cette méthode est utilisée pour annuler les changements si nécessaire
        $this->addSql('ALTER TABLE album DROP image_path');
    }

}
