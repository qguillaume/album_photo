<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250103021243 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE album ADD photo_count INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE photo_like RENAME INDEX idx_ac6340b3a76ed395 TO IDX_2D52F247A76ED395');
        $this->addSql('ALTER TABLE photo_like RENAME INDEX idx_ac6340b37e9e4c8c TO IDX_2D52F2477E9E4C8C');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE album DROP photo_count');
        $this->addSql('ALTER TABLE photo_like RENAME INDEX idx_2d52f2477e9e4c8c TO IDX_AC6340B37E9E4C8C');
        $this->addSql('ALTER TABLE photo_like RENAME INDEX idx_2d52f247a76ed395 TO IDX_AC6340B3A76ED395');
    }
}
