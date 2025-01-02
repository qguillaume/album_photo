import React from "react";
import ReactDOM from "react-dom/client";
import AlbumControls from "../components/AlbumControls";
import PhotoControls from "../components/PhotoControls"; // Importation de PhotoControls
import PhotoViewer from "../components/PhotoViewer";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Chargement des conteneurs React...");

  // Initialisation des contrôles des albums
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

            fetch(`${process.env.REACT_APP_API_URL}/albums/rename/${id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: newName }),
            })
              .then((response) => response.json())
              .then(() => alert(`Album renommé en : "${newName}"`))
              .catch(() => alert("Erreur lors du renommage de l'album."));
          }}
          onDelete={(id) => {
            fetch(`${process.env.REACT_APP_API_URL}/albums/delete/${id}`, { method: "DELETE" })
              .then(() => {
                alert("Album supprimé avec succès");
                el.remove();
              })
              .catch(() => alert("Erreur lors de la suppression de l'album."));
          }}
        />
      );
    } else {
      console.error("Données manquantes pour l'album :", el);
    }
  });

  // Initialisation des contrôles des photos
  document.querySelectorAll("[id^='photo-controls-']").forEach((el) => {
    const photoId = el.getAttribute("data-photo-id");
    const photoTitle = el.getAttribute("data-photo-title");
    const photoUrl = el.getAttribute("data-photo-url");
    const initialLikesCount = parseInt(el.getAttribute("data-initial-likes") || "0", 10);

    const onLike = (id: number) => {
      console.log(`Photo ${id} aimée!`);
      // Gérer la logique ici si tu veux mettre à jour l'état des likes dans le parent
    };

    if (photoId && photoTitle && photoUrl) {
      console.log(`Initialisation React : Photo ${photoTitle} (ID: ${photoId})`);

      ReactDOM.createRoot(el).render(
        <PhotoControls
          photoId={parseInt(photoId, 10)}
          photoTitle={photoTitle}
          photoUrl={photoUrl}
          initialLikesCount={initialLikesCount}
          onView={() => {}}
          onRename={(id, newName) => {
            fetch(`${process.env.REACT_APP_API_URL}/photo/rename/${id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newName }),
            })
              .then(() => alert(`Photo renommée en : "${newName}"`))
              .catch(() => alert("Erreur lors du renommage de la photo."));
          }}
          onDelete={(id) => {
            fetch(`${process.env.REACT_APP_API_URL}/photo/delete/${id}`, { method: "DELETE" })
              .then(() => {
                alert("Photo supprimée avec succès");
                el.remove();
              })
              .catch(() => alert("Erreur lors de la suppression de la photo."));
          }}
          onLike={onLike} // Passer la fonction `onLike`
        />
      );
    } else {
      console.error("Données manquantes pour la photo :", el);
    }
  });
});
