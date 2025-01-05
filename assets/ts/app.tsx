import React, { useState, useEffect } from "react";
import CookieConsent from 'react-cookie-consent';
import ReactDOM from "react-dom/client";
import AlbumControls from "../components/AlbumControls";
import PhotoControls from "../components/PhotoControls";
import PhotoTable from "../components/PhotoTable";
import Timeline from "../components/Timeline";
import ContactButton from "../components/ContactButton"; 
import { Photo, Album } from "./types";
import { BrowserRouter } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Composant principal pour téléchargement du CV et contact
const CVContact: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Durée de l'animation en millisecondes
      easing: 'ease-in-out', // Transition fluide
      once: true, // Animation ne se produit qu'une fois
      offset: 120, // Décalage avant déclenchement
      mirror: false, // Évite les répétitions inutiles
    });
  }, []);
  const handleDownloadCV = () => {
    const cvUrl = "/files/CV.pdf";
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = "CV.pdf"; // Le nom donné au fichier téléchargé
    document.body.appendChild(link); // Ajoute le lien temporairement dans le DOM
    link.click(); // Simule un clic pour télécharger le fichier
    document.body.removeChild(link); // Retire le lien du DOM après le clic
  };

  return (
    <div className="cv-contact">
      <h2 data-aos="zoom-in">Mon profil vous intéresse ?</h2>
      <p  data-aos="fade-up">Contactez-moi pour toute collaboration ou projet !</p>
      <div className="cvc-buttons" data-aos="fade-up">
        <ContactButton /> {/* Utilisation du composant ContactButton */}
        <button className="green-button" onClick={handleDownloadCV}>
          Télécharger mon CV
        </button>
      </div>
    </div>
  );
};

// Composant principal PhotosTable
const PhotosTable = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const albumsFromTwig = window.albumsData || [];
    const photosFromTwig = window.photosData || [];

    setAlbums(albumsFromTwig);
    setPhotos(photosFromTwig);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/photos_list`)
      .then((response) => response.json())
      .then((data) => {
        setPhotos(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des photos:", error);
      });

    fetch(`${process.env.REACT_APP_API_URL}/albums_list`)
      .then((response) => response.json())
      .then((data) => {
        setAlbums(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des albums:", error);
      });
  }, []);

  const handleDelete = (id: number, albumId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      fetch(`${process.env.REACT_APP_API_URL}/photo/delete/${id}`, { method: "DELETE" })
        .then((response) => {
          if (response.ok) {
            setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id));
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
            alert("Photo supprimée !");
          } else {
            alert("Erreur lors de la suppression.");
          }
        })
        .catch((error) => console.error("Erreur lors de la suppression de la photo :", error));
    }
  };

  return (
    <div>
      <PhotoTable
        photos={photos}
        albums={albums}
        onPhotosUpdate={setPhotos}
        onAlbumsUpdate={setAlbums}
      />
    </div>
  );
};

// Initialisation des contrôles des albums et photos (en dehors des composants React)
document.addEventListener("DOMContentLoaded", () => {
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
              headers: { "Content-Type": "application/json" },
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
          onLike={onLike}
        />
      );
    } else {
      console.error("Données manquantes pour la photo :", el);
    }
  });

  // Rendre le tableau des photos dans le DOM
  const photosTableElement = document.getElementById("photos-table");
  if (photosTableElement) {
    ReactDOM.createRoot(photosTableElement).render(<PhotosTable />);
  }

  // Rendre le consentement des cookies
  const cookieConsentElement = document.getElementById("cookie-consent");
  if (cookieConsentElement) {
    ReactDOM.createRoot(cookieConsentElement).render(
      <CookieConsent
        location="bottom"
        buttonText="Accepter"
        cookieName="user-consent"
        onAccept={() => console.log("Consentement accepté")}
        onDecline={() => console.log("Consentement refusé")}
        enableDeclineButton
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
  }

  // Rendre la timeline dans le DOM
  const timelineRoot = document.getElementById("timeline-root");
  if (timelineRoot) {
    ReactDOM.createRoot(timelineRoot).render(
      <React.StrictMode>
        <Timeline />
      </React.StrictMode>
    );
  }

  const cvcElement = document.getElementById("cv_contact");
    if (cvcElement) {
      ReactDOM.createRoot(cvcElement).render(
        <BrowserRouter>
          <CVContact />
        </BrowserRouter>
      );
    }
  });

