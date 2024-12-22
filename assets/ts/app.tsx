import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import AlbumControls from "../components/AlbumControls"; // Importation du composant pour les albums
import PhotoControls from "../components/PhotoControls"; // Importation du composant pour les photos
import PhotoViewer from "../components/PhotoViewer"; // Importation du composant pour afficher la photo en grand

// Fonction principale pour initialiser React sur chaque conteneur généré par Twig
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
            console.log("API URL renom:", process.env.REACT_APP_API_URL);
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
            console.log("API URL suppress:", process.env.REACT_APP_API_URL);
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

  // Initialisation des contrôles des photos
  document.querySelectorAll("[id^='photo-controls-']").forEach((el) => {
    const photoId = el.getAttribute("data-photo-id");
    const photoTitle = el.getAttribute("data-photo-title");
    const photoUrl = el.getAttribute("data-photo-url"); // Récupération de l'URL de la photo

    if (photoId && photoTitle && photoUrl) {
      console.log(`Initialisation React : Photo ${photoTitle} (ID: ${photoId})`);

      ReactDOM.createRoot(el).render(
        <PhotoControls
          photoId={parseInt(photoId, 10)}
          photoTitle={photoTitle}
          photoUrl={photoUrl}
          onView={(id) => {}}
          onRename={(id, newName) => {
            console.log("API URL renom:", process.env.REACT_APP_API_URL);
            console.log(`Renommage : Photo ID ${id} -> Nouveau nom : "${newName}"`);

            fetch(`${process.env.REACT_APP_API_URL}/photo/rename/${photoId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: newName }),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Erreur lors du renommage de la photo");
                }
                return response.json();
              })
              .then((data) => {
                console.log("Succès :", data);
                alert(`Photo renommée en : "${newName}"`);
                window.location.reload(); // Recharge la page pour voir les changements
              })
              .catch((error) => {
                console.error("Erreur :", error);
                alert("Une erreur s'est produite lors du renommage.");
              });
          }}
          onDelete={(id) => {
            console.log("API URL suppress:", process.env.REACT_APP_API_URL);
            console.log(`Suppression : Photo ID ${id}`);

            fetch(`${process.env.REACT_APP_API_URL}/photo/delete/${photoId}`, {
              method: "DELETE",
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Erreur lors de la suppression de la photo");
                }
                return response.json();
              })
              .then((data) => {
                console.log("Succès :", data);
                alert(`Photo supprimée avec succès`);
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
      console.error("Données manquantes pour la photo :", el);
    }
  });
});
