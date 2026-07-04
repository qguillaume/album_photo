<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250113182659 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute la contrainte NOT NULL pour les colonnes is_approved et is_visible dans la table album';
    }

    public function up(Schema $schema): void
    {
        // Ajouter NOT NULL sur is_approved
        $this->addSql('ALTER TABLE album CHANGE is_approved is_approved BOOLEAN NOT NULL DEFAULT FALSE AFTER created_at');

        // Ajouter NOT NULL sur is_visible
        $this->addSql('ALTER TABLE album CHANGE is_visible is_visible BOOLEAN NOT NULL DEFAULT FALSE AFTER is_approved');
    }

    public function down(Schema $schema): void
    {
        // Annuler les modifications : enlever la contrainte NOT NULL
        $this->addSql('ALTER TABLE album CHANGE is_approved is_approved BOOLEAN DEFAULT FALSE AFTER created_at');
        $this->addSql('ALTER TABLE album CHANGE is_visible is_visible BOOLEAN DEFAULT FALSE AFTER is_approved');
    }
}
