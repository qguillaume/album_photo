<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter une clé étrangère entre photo et album, et modification de album_id pour être NOT NULL.
 */
final class Version20241223121006 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout de la clé étrangère entre photo et album et modification de album_id pour être NOT NULL';
    }

    public function up(Schema $schema): void
    {
        // Vérification que la plateforme est bien MySQL
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        // 1. Modifier la colonne album_id pour qu'elle accepte NULL (temporairement)
        $this->addSql('ALTER TABLE photo CHANGE album_id album_id INT DEFAULT NULL');

        // 2. Ajouter la contrainte de clé étrangère avec ON DELETE CASCADE
        $this->addSql('
            ALTER TABLE photo 
            ADD CONSTRAINT FK_PHOTO_ALBUM FOREIGN KEY (album_id) REFERENCES album (id) ON DELETE CASCADE
        ');

        // 3. Modifier la colonne album_id pour qu'elle soit NOT NULL
        $this->addSql('ALTER TABLE photo CHANGE album_id album_id INT NOT NULL');

        // 4. Renommer l'index si nécessaire
        $this->addSql('ALTER TABLE photo RENAME INDEX fk_photo_album TO IDX_14B784181137ABCF');
    }

    public function down(Schema $schema): void
    {
        // Vérification que la plateforme est bien MySQL
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        // 1. Supprimer la contrainte de clé étrangère
        $this->addSql('
            ALTER TABLE photo 
            DROP FOREIGN KEY FK_PHOTO_ALBUM
        ');

        // 2. Revertir la colonne album_id pour accepter NULL par défaut
        $this->addSql('ALTER TABLE photo CHANGE album_id album_id INT DEFAULT NULL');

        // 3. Renommer l'index si nécessaire
        $this->addSql('ALTER TABLE photo RENAME INDEX IDX_14B784181137ABCF TO fk_photo_album');
    }
}
