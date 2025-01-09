import React, { useState, useEffect } from 'react';
import AlbumTable from './AlbumTable';
import PhotoTable from './PhotoTable';
import UserTable from './UserTable';
import ArticleTable from './ArticleTable';
import CommentTable from './CommentTable';
import { Photo, Album, User, Article, Comment } from '../ts/types';

const DashboardTabs: React.FC = () => {
  // L'état pour savoir quel onglet est sélectionné
  const [activeTab, setActiveTab] = useState<'albums' | 'photos' | 'users' | 'articles' | 'comments'>('albums');
  
  // États pour stocker les photos, albums, utilisateurs, articles et commentaires
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Vérifier si les données ont déjà été chargées pour éviter de refaire les requêtes
  useEffect(() => {
    // Si les données ne sont pas encore chargées, on les charge
    if (photos.length === 0) {
      fetch('/photos_list')
        .then(response => response.json())
        .then(data => setPhotos(data));
    }
    if (albums.length === 0) {
      fetch('/albums_list')
        .then(response => response.json())
        .then(data => setAlbums(data));
    }
    if (users.length === 0) {
      fetch('/users_list')
        .then(response => response.json())
        .then(data => setUsers(data));
    }
    if (articles.length === 0) {
      fetch('/articles_list')
        .then(response => response.json())
        .then(data => setArticles(data));
    }
    if (comments.length === 0) {
      fetch('/comments_list')
        .then(response => response.json())
        .then(data => setComments(data));
    }
  }, []); // Le tableau vide empêche la ré-exécution du useEffect
  //}, [photos, albums, users, articles, comments]); // Assurer que la requête n'est effectuée qu'une fois par type de données

  // Fonction pour changer d'onglet
  const handleTabClick = (tab: 'albums' | 'photos' | 'users' | 'articles' | 'comments') => {
    setActiveTab(tab);
  };

  const handlePhotosUpdate = (updatedPhotos: Photo[]) => {
    setPhotos(updatedPhotos);
  };

  const handleAlbumsUpdate = (updatedAlbums: Album[]) => {
    setAlbums(updatedAlbums);
  };

  // Éditer un article
  const handleArticleEdit = (id: number, newContent: string) => {
    fetch(`/article/${id}/edit_dashboard`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    })
      .then((response) => {
        if (response.ok) {
          setArticles((prevArticles) =>
            prevArticles.map((article) =>
              article.id === id ? { ...article, content: newContent } : article
            )
          );
          alert("Article mis à jour !");
        } else {
          alert("Erreur lors de la mise à jour de l'article.");
        }
      })
      .catch((error) => console.error("Erreur :", error));
  };

  // Supprimer un article
  const handleArticleDelete = (id: number) => {
    fetch(`/article/${id}/delete`, { method: "POST" })
      .then((response) => {
        if (response.ok) {
          setArticles((prevArticles) =>
            prevArticles.filter((article) => article.id !== id)
          );
          alert("Article supprimé !");
        } else {
          alert("Erreur lors de la suppression de l'article.");
        }
      })
      .catch((error) => console.error("Erreur :", error));
  };

  // Éditer un commentaire
  const handleCommentEdit = (id: number, newContent: string) => {
    fetch(`/comment/${id}/edit_dashboard`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    })
      .then((response) => {
        if (response.ok) {
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === id ? { ...comment, content: newContent } : comment
            )
          );
          alert("Commentaire mis à jour !");
        } else {
          alert("Erreur lors de la mise à jour du commentaire.");
        }
      })
      .catch((error) => console.error("Erreur :", error));
  };

  // Supprimer un commentaire
  const handleCommentDelete = (id: number) => {
    fetch(`/comment/${id}/delete_dashboard`, { method: "DELETE" })
      .then((response) => {
        if (response.ok) {
          setComments((prevComments) =>
            prevComments.filter((comment) => comment.id !== id)
          );
          alert("Commentaire supprimé !");
        } else {
          alert("Erreur lors de la suppression du commentaire.");
        }
      })
      .catch((error) => console.error("Erreur :", error));
  };

  return (
    <div>
      <div className="tabs">
        <button
          className={`tab-button albums ${activeTab === 'albums' ? 'active' : ''}`}
          onClick={() => handleTabClick('albums')}
        >
          Albums
        </button>
        <button
          className={`tab-button photos ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => handleTabClick('photos')}
        >
          Photos
        </button>
        <button
          className={`tab-button users ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabClick('users')}
        >
          Users
        </button>
        <button
          className={`tab-button articles ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => handleTabClick('articles')}
        >
          Articles
        </button>
        <button
          className={`tab-button comments ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => handleTabClick('comments')}
        >
          Commentaires
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'albums' && <AlbumTable albums={albums} onAlbumsUpdate={handleAlbumsUpdate} />}
        {activeTab === 'photos' && (
          <PhotoTable
            photos={photos}
            albums={albums}
            onPhotosUpdate={handlePhotosUpdate}
            onAlbumsUpdate={handleAlbumsUpdate}
          />
        )}
        {activeTab === 'users' && <UserTable users={users} />}
        {activeTab === 'articles' && <ArticleTable articles={articles} onEdit={handleArticleEdit} onDelete={handleArticleDelete} />}
        {activeTab === 'comments' && <CommentTable comments={comments} onEdit={handleCommentEdit} onDelete={handleCommentDelete} />}
      </div>
    </div>
  );
};

export default DashboardTabs;
