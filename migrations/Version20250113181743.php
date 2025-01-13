<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250113181743 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Inverser l\'ordre des colonnes is_visible et is_approved dans la table album';
    }

    public function up(Schema $schema): void
    {
        // Déplacer is_approved après created_at
        $this->addSql('ALTER TABLE album CHANGE is_approved is_approved BOOLEAN DEFAULT FALSE AFTER created_at');

        // Déplacer is_visible après is_approved
        $this->addSql('ALTER TABLE album CHANGE is_visible is_visible BOOLEAN DEFAULT FALSE AFTER is_approved');
    }

    public function down(Schema $schema): void
    {
        // Annuler la migration en réinversant l'ordre des colonnes
        $this->addSql('ALTER TABLE album CHANGE is_visible is_visible BOOLEAN DEFAULT FALSE AFTER created_at');
        $this->addSql('ALTER TABLE album CHANGE is_approved is_approved BOOLEAN DEFAULT FALSE AFTER is_visible');
    }
}
