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
            console.log("API URL renom:", process.env.REACT_APP_API_URL);  // Ajouté pour vérifier la valeur
            console.log(`Renommage : Album ID ${id} -> Nouveau nom : "${newName}"`);
          
            fetch(`${process.env.REACT_APP_API_URL}/albums/rename/${albumId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: newName }),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Erreur lors du renommage de l'album");
                }
                return response.json();
              })
              .then((data) => {
                console.log("Succès :", data);
                alert(`Album renommé en : "${newName}"`);
                window.location.reload(); // Recharge la page pour voir les changements
              })
              .catch((error) => {
                console.error("Erreur :", error);
                alert("Une erreur s'est produite lors du renommage.");
              });
          }}

          onDelete={(id) => {
            console.log("API URL suppress:", process.env.REACT_APP_API_URL);  // Ajouté pour vérifier la valeur
            console.log(`Suppression : Album ID ${id}`);

            fetch(`${process.env.REACT_APP_API_URL}/albums/delete/${albumId}`, {
                method: "DELETE",
            })
                .then((response) => {
                if (!response.ok) {
                    throw new Error("Erreur lors de la suppression de l'album");
                }
                return response.json();
                })
                .then((data) => {
                console.log("Succès :", data);
                alert(`Album supprimé avec succès`);
                window.location.reload(); // Recharge la page pour voir les changements
                })
                .catch((error) => {
                console.error("Erreur :", error);
                alert("Une erreur s'est produite lors de la suppression.");
                });
          }}
        />
      );
    } else {
      console.error("Données manquantes pour l'album :", el);
    }
  });
});
