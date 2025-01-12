import React, { useState, useEffect, Suspense } from "react";
import CookieConsent from 'react-cookie-consent';
import ReactDOM from "react-dom/client";
import AlbumControls from "../components/AlbumControls";
import PhotoControls from "../components/PhotoControls";
import PhotoTable from "../components/PhotoTable";
import Timeline from "../components/Timeline";
import ContactButton from "../components/ContactButton"; 
import { Photo, Album, User, Article, Comment, Theme } from "./types";
import { BrowserRouter } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTranslation } from 'react-i18next'; // Importer useTranslation ici pour l'utiliser dans les composants
import ProjectCarousel from '../components/ProjectCarousel';
import UserTable from "../components/UserTable";
import AlbumTable from "../components/AlbumTable";
import ArticleTable from "../components/ArticleTable";
import CommentTable from "../components/CommentTable";
import ThemeTable from "../components/ThemeTable";
import DashboardTabs from "../components/DashboardTabs";
import ThemeToggle from "../components/ThemeToggle";

import '../../public/i18n'; // Importer le fichier de configuration de i18next

import TinyEditor from "./TinyEditor";  // Assurez-vous que le chemin est correct

const App = () => {
  return (
    <div>
      <TinyEditor />
    </div>
  );
};

export default App;

// Composant principal pour téléchargement du CV et contact
const CVContact: React.FC = () => {
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      offset: 120,
      mirror: false,
    });
    if (i18n.isInitialized) {
      setIsReady(true); // Attendre que i18next soit initialisé
    }
  }, [i18n.isInitialized]);

  if (!isReady) return null; // Afficher rien ou un loader pendant l'initialisation

  const handleDownloadCV = () => {
    const cvUrl = "/files/CV.pdf";
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = "CV.pdf"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="cv-contact">
      <div className="cvc-buttons" data-aos="fade-up">
        <ContactButton />
        <button className="green-button" onClick={handleDownloadCV}>
          {t('download_cv')} {/* Traduction pour le texte du bouton */}
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

const AlbumsTable = () => {
  const [albums, setAlbums] = useState<Album[]>([]);

  // Fonction pour mettre à jour les albums
  const handleAlbumsUpdate = (updatedAlbums: Album[]) => {
    setAlbums(updatedAlbums);
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/albums_list`)
      .then((response) => response.json())
      .then((data) => setAlbums(data))
      .catch((error) => console.error("Erreur lors du fetch des albums", error));
  }, []);
  

  return (
    <div>
      {albums.map((album) => (
        <div>
          <AlbumTable albums={albums} onAlbumsUpdate={handleAlbumsUpdate} />
        </div>
      ))}
    </div>
  );
};

const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/users_list`)
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Erreur lors du fetch des utilisateurs", error));
  }, []);

  return (
    <div>
      <UserTable users={users} />
    </div>
  );
};


  const ThemesTable = () => {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [newThemeName, setNewThemeName] = useState<string>(""); // Pour stocker le nom du nouveau thème
  
    useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/themes_list`)
        .then((response) => response.json())
        .then((data) => setThemes(data))
        .catch((error) => console.error("Erreur lors du fetch des thèmes", error));
    }, []);
  
    // Fonction de mise à jour de l'API
    const handleEdit = async (themeId: number) => {
      const newThemeName = prompt("Entrez le nouveau nom du thème :");
      if (!newThemeName?.trim()) {
        alert("Le nom du thème ne peut pas être vide.");
        return;
      }
    
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/theme/${themeId}/edit_dashboard`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newThemeName }),
        });
    
        if (!response.ok) {
          throw new Error("Échec de la mise à jour du thème");
        }
    
        const updatedTheme = await response.json();
        setThemes((prevThemes) =>
          prevThemes.map((theme) =>
            theme.id === themeId ? updatedTheme : theme
          )
        );
      } catch (error) {
        console.error("Erreur lors de la mise à jour du thème", error);
      }
    };
  
    return (
      <div>
        <ThemeTable themes={themes} onEdit={handleEdit} />
      </div>
    );
  };
  

const ArticlesTable = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  // Charger les articles depuis l'API
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/articles_list`)
      .then((response) => response.json())
      .then((data) => setArticles(data))
      .catch((error) => console.error("Erreur lors du fetch des articles", error));
  }, []);

  // Fonction pour éditer un article
  const handleEdit = (id: number, newContent: string) => {
    // 1. Mettre à jour localement l'article dans l'état
    setArticles((prevArticles) =>
      prevArticles.map((article) =>
        article.id === id ? { ...article, content: newContent } : article
      )
    );
  
    // 2. Mettre à jour l'article sur l'API
    fetch(`${process.env.REACT_APP_API_URL}/article/${id}/edit`, {
      method: "PUT", //test put au lieu de post
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newContent }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour de l\'article');
        }
        alert("Article mis à jour avec succès !");
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de l'article :", error);
        alert("Erreur lors de la mise à jour de l'article.");
      });
  };

  return (
    <div>
      <ArticleTable
        articles={articles}
        onEdit={handleEdit}
        onDelete={(id) => {
          console.log(`Deleting article ${id}`);
        }}
      />
    </div>
  );
};

const CommentsTable = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  // Charger les commentaires depuis l'API
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/commentaires_list`)
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("Erreur lors du fetch des commentaires", error));
  }, []);

  // Fonction pour éditer un commentaire
  const handleEdit = (id: number, newContent: string) => {
    // 1. Mettre à jour localement le commentaire dans l'état
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === id ? { ...comment, content: newContent } : comment
      )
    );
  
    // 2. Mettre à jour le commentaire sur l'API
    fetch(`${process.env.REACT_APP_API_URL}/comment/${id}/edit`, {
      method: "PUT", //test put au lieu de post
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newContent }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour du commentaire');
        }
        alert("Commentaire mis à jour avec succès !");
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du commentaire :", error);
        alert("Erreur lors de la mise à jour du commentaire.");
      });
  };

  return (
    <div>
      <CommentTable
        comments={comments}
        onEdit={handleEdit}
        onDelete={(id) => {
          console.log(`Deleting comment ${id}`);
        }}
      />
    </div>
  );
};

  // Ajouter le composant ThemeToggle dans le DOM
  const ThemeToggleRoot = document.getElementById('lightModeToggle');  // Récupère l'élément DOM

  if (ThemeToggleRoot) {
    const root = ReactDOM.createRoot(ThemeToggleRoot);  // Crée la racine React
    root.render(<ThemeToggle />);  // Rendre le composant dans l'élément
  }

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
            fetch(`${process.env.REACT_APP_API_URL}/album/rename/${id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newName }),
            })
              .then(() => {
                alert(`Album renommé en : "${newName}"`);
                window.location.reload();
              })
              .catch(() => alert("Erreur lors du renommage de l'album."));
          }}
          onDelete={(id) => {
            fetch(`${process.env.REACT_APP_API_URL}/album/delete/${id}`, { method: "DELETE" })
              .then(() => {
                alert("Album supprimé avec succès");
                el.remove();
                window.location.reload();
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
    const photoPath = el.getAttribute("data-photo-path") || "#";

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
          photoPath={photoPath}
          onRename={(id, newName) => {
            fetch(`${process.env.REACT_APP_API_URL}/photo/rename/${id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newName }),
            })
              .then(() => {
                alert(`Photo renommée en : "${newName}"`);
                window.location.reload();
              })
              .catch(() => alert("Erreur lors du renommage de la photo."));
          }}
          onDelete={(id) => {
            fetch(`${process.env.REACT_APP_API_URL}/photo/delete/${id}`, { method: "DELETE" })
              .then(() => {
                alert("Photo supprimée avec succès");
                el.remove();
                window.location.reload();
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

  // Rendre le tableau des albums dans le DOM
  const albumsTableElement = document.getElementById("albums-table");
  if (albumsTableElement) {
    ReactDOM.createRoot(albumsTableElement).render(<AlbumsTable />);
  }

  // Rendre le tableau des users dans le DOM
  const usersTableElement = document.getElementById("users-table");
  if (usersTableElement) {
    ReactDOM.createRoot(usersTableElement).render(<UsersTable />);
  }

  // Rendre le tableau des articles dans le DOM
  const articlesTableElement = document.getElementById("articles-table");
  if (articlesTableElement) {
    ReactDOM.createRoot(articlesTableElement).render(<ArticlesTable />);
  }

  // Rendre le tableau des comments dans le DOM
  const commentsTableElement = document.getElementById("comments-table");
  if (commentsTableElement) {
    ReactDOM.createRoot(commentsTableElement).render(<CommentsTable />);
  }

  // Rendre le tableau des themes dans le DOM
  const themesTableElement = document.getElementById("themes-table");
  if (themesTableElement) {
    ReactDOM.createRoot(themesTableElement).render(<ThemesTable />);
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

  // Ajouter le composant CVContact dans le DOM
  const cvcRoot = document.getElementById("cv_contact");
  if (cvcRoot) {
    ReactDOM.createRoot(cvcRoot).render(
      <BrowserRouter>
        <CVContact />
      </BrowserRouter>
    );
  }

  // Ajouter le composant carousel dans le DOM
  const carouselElement = document.getElementById('project-carousel');  // Récupère l'élément DOM

  if (carouselElement) {
    const root = ReactDOM.createRoot(carouselElement);  // Crée la racine React
    root.render(<ProjectCarousel />);  // Rendre le composant dans l'élément
  }

  // Ajouter le composant DashboardTabs dans le DOM
  const DashboardTabsRoot = document.getElementById('dashboard-tabs');  // Récupère l'élément DOM

  if (DashboardTabsRoot) {
    const root = ReactDOM.createRoot(DashboardTabsRoot);  // Crée la racine React
    root.render(<DashboardTabs />);  // Rendre le composant dans l'élément
  }
});




