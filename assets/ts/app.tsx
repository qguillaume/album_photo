import React from "react";
import ReactDOM from "react-dom/client";

// Composant React pour gérer les actions d'un album
interface AlbumControlsProps {
  albumId: number;
  albumName: string;
  onRename: (id: number, newName: string) => void;
  onDelete: (id: number) => void;
}

const AlbumControls: React.FC<AlbumControlsProps> = ({ albumId, albumName, onRename, onDelete }) => {
  const handleRename = () => {
    const newName = prompt(`Renommer l'album "${albumName}" :`, albumName);
    if (newName && newName.trim() !== "") {
      onRename(albumId, newName);
    }
  };

  const handleDelete = () => {
    if (confirm(`Voulez-vous vraiment supprimer l'album "${albumName}" ?`)) {
      onDelete(albumId);
    }
  };

  return (
    <div className="album-controls">
      <button className="btn-rename" onClick={handleRename}>
        ✏️ Modifier
      </button>
      <button className="btn-delete" onClick={handleDelete}>
        ❌ Supprimer
      </button>
    </div>
  );
};

// Fonction principale pour initialiser React sur chaque conteneur généré par Twig
document.addEventListener("DOMContentLoaded", () => {
  console.log("Chargement des conteneurs React...");

  document.querySelectorAll("[id^='album-controls-']").forEach((el) => {
    const albumId = el.getAttribute("data-album-id");
    const albumName = el.getAttribute("data-album-name");

    if (albumId && albumName) {
      console.log(`Initialisation React : Album ${albumName} (ID: ${albumId})`);

      ReactDOM.createRoot(el).render(
        <AlbumControls
          albumId={parseInt(albumId, 10)}
          albumName={albumName}
          onRename={(id, newName) => {
            console.log(`Renommage : Album ID ${id} -> Nouveau nom : "${newName}"`);
            // Logique d'appel à l'API ou rechargement de la page après renommage
            alert(`Album renommé en : "${newName}"`);
          }}
          onDelete={(id) => {
            console.log(`Suppression : Album ID ${id}`);
            // Logique d'appel à l'API ou rechargement de la page après suppression
            alert(`Album supprimé (ID : ${id})`);
          }}
        />
      );
    } else {
      console.error("Données manquantes pour l'album :", el);
    }
  });
});
