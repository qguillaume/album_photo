import React, { useState, useEffect, Suspense } from "react";
import CookieConsent from 'react-cookie-consent';
import ReactDOM from "react-dom/client";
import AlbumControls from "../components/AlbumControls";
import PhotoControls from "../components/PhotoControls";
import PhotoTable from "../components/PhotoTable";
import Timeline from "../components/Timeline";
import ContactButton from "../components/ContactButton"; 
import { Photo, Album, User, Article, Comment, Theme } from "./types";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Header from "../components/Header";
import Languette from "../components/Languette";
import Footer from "../components/Footer";
import { UserProvider } from '../context/UserContext';
import Presentation from '../components/Presentation';
import ContactForm from '../components/ContactForm';
import ConnexionForm from '../components/ConnexionForm';
import RegisterForm from '../components/RegisterForm';
import AlbumForm from '../components/AlbumForm';
import PhotoForm from '../components/PhotoForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import ArticleForm from '../components/ArticleForm';
import ThemeForm from '../components/ThemeForm';
import CommentForm from '../components/CommentForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import CGU from '../components/Cgu';
import MentionsLegales from '../components/MentionsLegales';
import PolitiqueConfidentialite from '../components/PolitiqueConfidentialite';
import Moderation from '../components/Moderation';
import DroitsAuteur from '../components/DroitsAuteur';
import Competence from '../components/Competence';
import Competences from '../components/Competences';
import '../../public/i18n';
import TinyEditor from "./TinyEditor";
/*
const App = () => {
  return (
    <div>
      <TinyEditor />
    </div>
  );
};
*/
const HeaderApp: React.FC = () => {
  return (
    <UserProvider>
      <Header />
    </UserProvider>
  );
};

export  { HeaderApp };


const headerRootElement = document.getElementById("header-root");

if (headerRootElement) {
  const root = ReactDOM.createRoot(headerRootElement);
  root.render(
    <React.StrictMode>
      <HeaderApp />
    </React.StrictMode>
  );
}

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
    <>
      <h2 data-aos="zoom-in">{t('profile_interest')}</h2>
      <p className="cv-p" data-aos="fade-up">{t('collab_sentence')}</p>
      <div className="cv-contact">
        <div className="cvc-buttons" data-aos="fade-up">
          <ContactButton />
          <button className="green-button" onClick={handleDownloadCV}>
            {t('download_cv')} {/* Traduction pour le texte du bouton */}
          </button>
        </div>
      </div>
    </>
  );
};



// Composant principal PhotosTable
const PhotosTable = () => {
  const [photos, setPhotos] = useState<Photo[]>([]); 
  const [albums, setAlbums] = useState<Album[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const albumsFromTwig = window.albumsData || [];
    const photosFromTwig = window.photosData || [];

    setAlbums(albumsFromTwig);
    setPhotos(photosFromTwig);
  }, []);

  useEffect(() => { 
    // Charger les photos depuis l'API
    fetch(`${process.env.REACT_APP_API_URL}/photos_list`)
      .then((response) => response.json())
      .then((data) => {
        setPhotos(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des photos:", error);
      });

    // Charger les albums depuis l'API
    fetch(`${process.env.REACT_APP_API_URL}/albums_list`)
      .then((response) => response.json())
      .then((data) => {
        setAlbums(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des albums:", error);
      });

    // Charger les utilisateurs depuis l'API
    fetch(`${process.env.REACT_APP_API_URL}/users_list`)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
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
        users={users}
        onPhotosUpdate={setPhotos}
        onAlbumsUpdate={setAlbums}
      />
    </div>
  );
};

const AlbumsTable = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  // Fonction pour mettre à jour les albums
  const handleAlbumsUpdate = (updatedAlbums: Album[]) => {
    setAlbums(updatedAlbums);
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/albums_list`)
      .then((response) => response.json())
      .then((data) => {
        setAlbums(data.albums);
        setUsers(data.users);
      })
      .catch((error) => console.error("Erreur lors du fetch des albums", error));
  }, []);


  return (
    <div>
      {albums.map((album) => (
        <div>
          <AlbumTable albums={albums} users={users} onAlbumsUpdate={handleAlbumsUpdate} />
        </div>
      ))}
    </div>
  );
};

const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Fonction pour récupérer les utilisateurs depuis l'API
  const updateUsers = async () => {
    try {
      const response = await fetch(`/users_list`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs.");
      }
      const data = await response.json();
      setUsers(data); // Met à jour la liste des utilisateurs dans l'état local
    } catch (error) {
      console.error("Erreur lors du fetch des utilisateurs :", error);
    }
  };

  // Appel de fetchUsers lors du montage du composant
  useEffect(() => {
    updateUsers();
  }, []);

  return (
    <div>
      <UserTable users={users} updateUsers={updateUsers} />
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

    // Charger les articles depuis l'API au montage du composant
    useEffect(() => {
      const fetchArticles = async () => {
        try {
          const response = await fetch('/articles_list');
          if (!response.ok) {
            throw new Error('Erreur lors du chargement des articles');
          }
          const data = await response.json();
          setArticles(data);
        } catch (error) {
          console.error(error);
        }
      };

      fetchArticles();
    }, []);  // Le tableau vide signifie que cet effet se déclenche uniquement au premier rendu

    // Fonction pour rafraîchir les articles après modification/suppression
    const updateArticles = async () => {
      try {
        const response = await fetch('/articles_list');
        if (!response.ok) {
          throw new Error('Erreur lors du rafraîchissement des articles');
        }
        const data = await response.json();
        setArticles(data); // Mettre à jour les articles
        //console.log('Articles mis à jour:', data); // Debugging
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <div>
        <ArticleTable
          articles={articles}
          updateArticles={updateArticles}
        />
      </div>
    );
  };

const CommentsTable = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      const response = await fetch('/commentaires_list');
      const data = await response.json();
      setComments(data);
    };

    fetchComments();
  }, []);

  // Fonction pour rafraîchir les commentaires après modification/suppression
  const updateComments = () => {
    fetch('/commentaires_list')
      .then((response) => response.json())
      .then((data) => setComments(data));
  };

  return (
    <div>
      <CommentTable comments={comments} updateComments={updateComments} />
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
              .then((response) => {
                if (response.ok) {
                  alert("Album supprimé avec succès");

                  // Redirection après succès
                  window.location.href = "/photos"; // Redirige vers la liste des albums
                } else {
                  // Gestion des erreurs renvoyées par le backend
                  response.json().then((data) => {
                    console.error("Erreur renvoyée par le backend :", data);
                    alert(data.message || "Erreur inconnue lors de la suppression.");
                  });
                }
              })
              .catch((error) => {
                console.error("Erreur :", error);
                alert("Erreur lors de la suppression de l'album.");
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
    const photoUrl = el.getAttribute("data-photo-url");
    const initialLikesCount = parseInt(el.getAttribute("data-initial-likes") || "0", 10);
    const photoPath = el.getAttribute("data-photo-path") || "#";
    const isOwnerString = el.getAttribute('data-is-owner');
    const isOwner = isOwnerString === '1' ? true : false;

    const onLike = (id: number) => {
      //console.log(`Photo ${id} aimée!`);
    };

    if (photoId && photoTitle && photoUrl) {
      ReactDOM.createRoot(el).render(
        <PhotoControls
          photoId={parseInt(photoId, 10)}
          photoTitle={photoTitle}
          photoUrl={photoUrl}
          initialLikesCount={initialLikesCount}
          photoPath={photoPath}
          isOwner={isOwner}
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
  const cvcRoot = document.getElementById("cv-contact-root");
  if (cvcRoot) {
    ReactDOM.createRoot(cvcRoot).render(
      <BrowserRouter>
        <CVContact />
      </BrowserRouter>
    );
  }

    // Ajouter le composant Presentation dans le DOM
    const presentationRoot = document.getElementById("presentation-root");
    if (presentationRoot) {
      ReactDOM.createRoot(presentationRoot).render(
        <BrowserRouter>
          <Presentation />
        </BrowserRouter>
      );
    }

  // Ajouter le composant carousel dans le DOM
  const carouselElementRoot = document.getElementById('project-carousel-root');  // Récupère l'élément DOM

  if (carouselElementRoot) {
    const root = ReactDOM.createRoot(carouselElementRoot);  // Crée la racine React
    root.render(<ProjectCarousel />);  // Rendre le composant dans l'élément
  }

  // Ajouter le composant DashboardTabs dans le DOM
  const DashboardTabsRoot = document.getElementById('dashboard-tabs');  // Récupère l'élément DOM

  if (DashboardTabsRoot) {
    const root = ReactDOM.createRoot(DashboardTabsRoot);  // Crée la racine React
    root.render(<DashboardTabs />);  // Rendre le composant dans l'élément
  }

  /////

  // Code pour rendre le formulaire de contact dans l'élément du DOM
  const contactFormRoot = document.getElementById('contact-form-root');

  if (contactFormRoot) {
    const root = ReactDOM.createRoot(contactFormRoot);
    root.render(<ContactForm />); // Rendre le composant ContactForm
  }

  // Code pour rendre le formulaire de connexion dans l'élément du DOM
  const connexionFormRoot = document.getElementById('connexion-form-root');

  if (connexionFormRoot) {
    const root = ReactDOM.createRoot(connexionFormRoot);
    root.render(<ConnexionForm />); // Rendre le composant ConnexionForm
  }

  // Code pour rendre le formulaire d'inscription dans l'élément du DOM
  const registerFormRoot = document.getElementById('register-form-root');

  if (registerFormRoot) {
    const root = ReactDOM.createRoot(registerFormRoot);
    root.render(<RegisterForm />); // Rendre le composant RegisterForm
  }

  // Code pour rendre la languette dans l'élément du DOM
  const languetteRootElement = document.getElementById("languette-root");

  if (languetteRootElement) {
    const root = ReactDOM.createRoot(languetteRootElement);
    root.render(<Languette />);
  }

  // Code pour rendre le footer dans l'élément du DOM
  const footerRootElement = document.getElementById("footer-root");

  if (footerRootElement) {
    const root = ReactDOM.createRoot(footerRootElement);
    root.render(<Footer />);
  }

  // Code pour rendre le formulaire d'albums dans l'élément du DOM
  const albumFormRoot = document.getElementById('album-form-root');

  if (albumFormRoot) {
    const root = ReactDOM.createRoot(albumFormRoot);
    root.render(<AlbumForm />); // Rendre le composant AlbumForm
  }

  // Code pour rendre le formulaire de photos dans l'élément du DOM
  const photoFormRoot = document.getElementById('photo-form-root');

  if (photoFormRoot) {
    const root = ReactDOM.createRoot(photoFormRoot);
    root.render(<PhotoForm />); // Rendre le composant PhotoForm
  }

  // Code pour rendre le formulaire d'oubli de mot de passe dans l'élément du DOM
  const forgotPasswordFormRoot = document.getElementById('forgot-form-root');

  if (forgotPasswordFormRoot) {
    const root = ReactDOM.createRoot(forgotPasswordFormRoot);
    root.render(<ForgotPasswordForm />); // Rendre le composant ForgotPasswordForm
  }

  // Code pour rendre le formulaire des articles dans l'élément du DOM
  const articleFormRoot = document.getElementById('article-form-root');

  if (articleFormRoot) {
    const root = ReactDOM.createRoot(articleFormRoot);
    root.render(<ArticleForm />); // Rendre le composant ArticleForm
  }

  // Code pour rendre le formulaire de themes dans l'élément du DOM
  const themeFormRoot = document.getElementById('theme-form-root');

  if (themeFormRoot) {
    const root = ReactDOM.createRoot(themeFormRoot);
    root.render(<ThemeForm />); // Rendre le composant ThemeForm
  }

  // Code pour rendre le formulaire de commentaires dans l'élément du DOM
  const commentFormRoot = document.getElementById('comment-form-root');

  if (commentFormRoot) {
    const root = ReactDOM.createRoot(commentFormRoot);
    root.render(<CommentForm />); // Rendre le composant CommentForm
  }

  // Code pour rendre le formulaire de changement de mot de passe dans l'élément du DOM
  const resetFormRoot = document.getElementById('reset-form-root');

  if (resetFormRoot) {
    const root = ReactDOM.createRoot(resetFormRoot);
    root.render(<ResetPasswordForm />); // Rendre le composant ResetPasswordForm
  }

  // Code pour rendre les CGU dans l'élément du DOM
  const CGURoot = document.getElementById('cgu-root');

  if (CGURoot) {
    const root = ReactDOM.createRoot(CGURoot);
    root.render(<CGU />); // Rendre le composant CGU
  }

  // Code pour rendre les mentions légales dans l'élément du DOM
  const MentionsRoot = document.getElementById('mentions-root');

  if (MentionsRoot) {
    const root = ReactDOM.createRoot(MentionsRoot);
    root.render(<MentionsLegales />); // Rendre le composant MentionsLegales
  }

  // Code pour rendre la politique de confidentialité dans l'élément du DOM
  const PolitiqueRoot = document.getElementById('politique-root');

  if (PolitiqueRoot) {
    const root = ReactDOM.createRoot(PolitiqueRoot);
    root.render(<PolitiqueConfidentialite />); // Rendre le composant PolitiqueConfidentialite
  }

  // Code pour rendre la modération dans l'élément du DOM
  const ModerationRoot = document.getElementById('moderation-root');

  if (ModerationRoot) {
    const root = ReactDOM.createRoot(ModerationRoot);
    root.render(<Moderation />); // Rendre le composant Moderation
  }

  // Code pour rendre les droits d'auteur dans l'élément du DOM
  const DroitsRoot = document.getElementById('droits-root');

  if (DroitsRoot) {
    const root = ReactDOM.createRoot(DroitsRoot);
    root.render(<DroitsAuteur />); // Rendre le composant DroitsAuteur
  }

  // Code pour rendre les compétences dans l'élément du DOM
  const CompetenceRoot = document.getElementById('competence-root');

  if (CompetenceRoot) {
    const root = ReactDOM.createRoot(CompetenceRoot);
    root.render(<Competence icon="/icons/html.svg" name="HTML" />); // Rendre le composant Competence
  }

  // Code pour rendre l'ensemble des compétences dans l'élément du DOM
  const CompetencesRoot = document.getElementById('competences-root');

  if (CompetencesRoot) {
    const root = ReactDOM.createRoot(CompetencesRoot);
    root.render(<Competences />); // Rendre le composant Competences
  }
});

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<ConnexionForm />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};