import React, { useState, useEffect } from "react";
import CookieConsent from 'react-cookie-consent';
import ReactDOM from "react-dom/client";
import AlbumControls from "../components/AlbumControls";
import PhotoControls from "../components/PhotoControls";
import PhotoTable from "../components/PhotoTable";
import Timeline from "../components/Timeline";
import { Photo, Album } from "./types";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Chargement des conteneurs React...");

  // Initialisation des contrôles des albums
  document.querySelectorAll("[id^='album-controls-']").forEach((el) => {
    const albumId = el.getAttribute("data-album-id");
    const albumName = el.getAttribute("data-album-name");

    if (albumId && albumName) {
      ReactDOM.createRoot(el).render(
        <AlbumControls
          albumId={parseInt(albumId, 10)}
          albumName={albumName}
          onRename={(id, newName) => {
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

  // Ajout du tableau pour les photos
  const PhotosTable = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);

    useEffect(() => {
      // Récupérer les données injectées de Twig
      const albumsFromTwig = window.albumsData || [];
      const photosFromTwig = window.photosData || [];

      // Initialiser l'état avec les données passées
      setAlbums(albumsFromTwig);
      setPhotos(photosFromTwig);
    }, []);
    
    // Chargement initial des photos et des albums
    useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/photos_list`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Photos chargées :", data);
          setPhotos(data);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des photos:", error);
        });

      fetch(`${process.env.REACT_APP_API_URL}/albums_list`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Albums chargés :", data);
          setAlbums(data);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des albums:", error);
        });
    }, []);

    // Fonction pour gérer la suppression d'une photo
    const handleDelete = (id: number, albumId: number) => {
      console.log("Suppression demandée pour la photo ID:", id, "Album ID:", albumId);
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
        fetch(`${process.env.REACT_APP_API_URL}/photo/delete/${id}`, { method: "DELETE" })
          .then((response) => {
            if (response.ok) {
              // Log de l'état avant la suppression
              console.log("Avant suppression - Photos :", photos);
              console.log("Avant suppression - Albums :", albums);

              // Mettre à jour la liste des photos après suppression
              setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id));

              // Mettre à jour l'album en retirant la photo supprimée
              setAlbums((prevAlbums) =>
                prevAlbums.map((album) =>
                  album.id === albumId
                    ? {
                        ...album,
                        photos: album.photos.filter((photo) => photo.id !== id),
                      }
                    : album
                )
              );

              // Log de l'état après la suppression
              console.log("Après suppression - Photos :", photos);
              console.log("Après suppression - Albums :", albums);

              alert("Photo supprimée !");
            } else {
              alert("Erreur lors de la suppression.");
            }
          })
          .catch((error) => console.error("Erreur lors de la suppression de la photo :", error));
      }
    };

    useEffect(() => {
      console.log("Albums après mise à jour dans PhotosTable :", albums);
      console.log("Photos après mise à jour dans PhotosTable :", photos);
    }, [albums, photos]); // Réagir aux mises à jour des albums et des photos

    return (
      <div>
        <PhotoTable
          photos={photos}
          albums={albums}
          onPhotosUpdate={setPhotos}  // Update des photos
          onAlbumsUpdate={setAlbums}  // Update des albums
        />
      </div>
    );
  };

  // Rendre le tableau des photos dans le DOM
  const photosTableElement = document.getElementById("photos-table");
  if (photosTableElement) {
    ReactDOM.createRoot(photosTableElement).render(<PhotosTable />);
  }

  // Ajout du bandeau de consentement des cookies
  ReactDOM.createRoot(document.getElementById("cookie-consent")!).render(
    <CookieConsent
      location="bottom"
      buttonText="Accepter"
      cookieName="user-consent"
      onAccept={() => console.log("Consentement accepté")}
      onDecline={() => console.log("Consentement refusé")}
      enableDeclineButton // Active le bouton "Refuser"
      declineButtonText="Refuser"
      style={{ background: "#2B373B" }}
      buttonStyle={{
        color: "#fff",
        fontSize: "13px",
        backgroundColor: "#2ecc71",
        borderRadius: "5px",
        padding: "10px 20px",
      }}
      declineButtonStyle={{
        color: "#fff",
        fontSize: "13px",
        backgroundColor: "#e74c3c",
        borderRadius: "5px",
        padding: "10px 20px",
      }}
      contentStyle={{
        fontSize: "14px",
        color: "#fff",
      }}
      
      expires={365}
      overlay={true}
    >
      Nous utilisons des cookies pour améliorer votre expérience. En continuant à naviguer, vous acceptez notre{" "}
      <a href="/politique-de-cookies" style={{ color: "#fff" }}>politique de cookies</a>.
    </CookieConsent>
  );
});

const timelineRoot = document.getElementById("timeline-root");
if (timelineRoot) {
  ReactDOM.createRoot(timelineRoot).render(
    <React.StrictMode>
      <Timeline />
    </React.StrictMode>
  );
}
