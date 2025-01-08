import React, { useState, useEffect } from 'react';
import AlbumTable from './AlbumTable';
import PhotoTable from './PhotoTable';
import UserTable from './UserTable';
import ArticleTable from './ArticleTable';
import { Photo, Album, User, Article } from '../ts/types';

const DashboardTabs: React.FC = () => {
  // L'état pour savoir quel onglet est sélectionné
  const [activeTab, setActiveTab] = useState<'albums' | 'photos' | 'users' | 'articles'>('albums');
  
  // États pour stocker les photos, albums, utilisateurs et articles
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

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
  }, []); // Le tableau vide empêche la ré-exécution du useEffect
  //}, [photos, albums, users, articles]); // Assurer que la requête n'est effectuée qu'une fois par type de données

  // Fonction pour changer d'onglet
  const handleTabClick = (tab: 'albums' | 'photos' | 'users' | 'articles') => {
    setActiveTab(tab);
  };

  const handlePhotosUpdate = (updatedPhotos: Photo[]) => {
    setPhotos(updatedPhotos);
  };

  const handleAlbumsUpdate = (updatedAlbums: Album[]) => {
    setAlbums(updatedAlbums);
  };

  const handleArticlesUpdate = (updatedArticles: Article[]) => {
    setArticles(updatedArticles);
  };

  // Éditer un article
  const handleArticleEdit = (id: number, newContent: string) => {
    fetch(`/article/${id}/edit`, {
      method: "POST",
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

  return (
    <div>
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'albums' ? 'active' : ''}`}
          onClick={() => handleTabClick('albums')}
        >
          Albums
        </button>
        <button
          className={`tab-button ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => handleTabClick('photos')}
        >
          Photos
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabClick('users')}
        >
          Users
        </button>
        <button
          className={`tab-button ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => handleTabClick('articles')}
        >
          Articles
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
        {activeTab === 'articles' && <ArticleTable articles={articles} onEdit={handleArticleEdit} onDelete={handleArticleDelete}/>}
      </div>
    </div>
  );
};

export default DashboardTabs;
