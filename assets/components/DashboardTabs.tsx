import React, { useState, useEffect } from 'react';
import AlbumTable from './AlbumTable';
import PhotoTable from './PhotoTable';
import UserTable from './UserTable';
import ArticleTable from './ArticleTable';
import CommentTable from './CommentTable';
import ThemeTable from './ThemeTable';
import { Photo, Album, User, Article, Comment, Theme } from '../ts/types';
import { useTranslation } from 'react-i18next';

const DashboardTabs: React.FC = () => {
  const { t } = useTranslation(); // Hook pour les traductions

  // L'état pour savoir quel onglet est sélectionné
  const [activeTab, setActiveTab] = useState<'albums' | 'photos' | 'users' | 'articles' | 'comments' | 'themes'>('albums');
  
  // États pour stocker les photos, albums, utilisateurs, articles, commentaires et themes
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);

  // Mise à jour du titre de la page en fonction de l'onglet actif
  useEffect(() => {
    const tabTitles: Record<typeof activeTab, string> = {
      albums: t('admin.albums'),
      photos: t('admin.photos'),
      users: t('admin.users'),
      articles: t('admin.articles'),
      comments: t('admin.comments'),
      themes: t('admin.themes'),
    };

    document.title = `${t('admin.dashboard')} - ${tabTitles[activeTab]}`;
  }, [activeTab, t]); // Réexécute si l'onglet actif ou la langue change

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
    if (themes.length === 0) {
      fetch('/themes_list')
        .then(response => response.json())
        .then(data => setThemes(data));
    }
  }, []); // Le tableau vide empêche la ré-exécution du useEffect
  //}, [photos, albums, users, articles, comments, themes]); // Assurer que la requête n'est effectuée qu'une fois par type de données

  // Fonction pour changer d'onglet
  const handleTabClick = (tab: 'albums' | 'photos' | 'users' | 'articles' | 'comments' | 'themes') => {
    setActiveTab(tab);
  };

  const handlePhotosUpdate = (updatedPhotos: Photo[]) => {
    setPhotos(updatedPhotos);
  };

  const handleAlbumsUpdate = (updatedAlbums: Album[]) => {
    setAlbums(updatedAlbums);
  };

  // Fonction pour mettre à jour les commentaires
  const updateComments = () => {
    fetch('/comments_list')
      .then((response) => response.json())
      .then((data) => setComments(data));
  };

  // Fonction pour mettre à jour les articles
  const updateArticles = () => {
    fetch('/articles_list')
      .then((response) => response.json())
      .then((data) => setArticles(data));
  };

  // Fonction pour mettre à jour les users
  const updateUsers = () => {
    fetch('/users_list')
      .then((response) => response.json())
      .then((data) => setUsers(data));
  };

  // Éditer un thème
  const handleThemeEdit = async (id: number, newName: string) => {
    const response = await fetch(`/theme/${id}/edit_dashboard`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newName,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      // Actualiser les données des thèmes après l'édition
      setThemes((prevThemes) =>
        prevThemes.map((theme) =>
          theme.id === id ? { ...theme, name: newName } : theme
        )
      );
    } else {
      console.error(result.message);  // Thème non trouvé
    }
  };

  return (
    <div>
      <h2>{t('admin.dashboard')}</h2>
      <div className="tabs">
        <button
          className={`tab-button albums ${activeTab === 'albums' ? 'active' : ''}`}
          onClick={() => handleTabClick('albums')}
        >
          {t('admin.albums')}
        </button>
        <button
          className={`tab-button photos ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => handleTabClick('photos')}
        >
          {t('admin.photos')}
        </button>
        <button
          className={`tab-button users ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabClick('users')}
        >
          {t('admin.users')}
        </button>
        <button
          className={`tab-button articles ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => handleTabClick('articles')}
        >
          {t('admin.articles')}
        </button>
        <button
          className={`tab-button comments ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => handleTabClick('comments')}
        >
          {t('admin.comments')}
        </button>
        <button
          className={`tab-button themes ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => handleTabClick('themes')}
        >
          {t('admin.themes')}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'albums' && <AlbumTable albums={albums} users={users} onAlbumsUpdate={handleAlbumsUpdate} />}
        {activeTab === 'photos' && (
          <PhotoTable
            photos={photos}
            albums={albums}
            users={users}
            onPhotosUpdate={handlePhotosUpdate}
            onAlbumsUpdate={handleAlbumsUpdate}
          />
        )}
        {activeTab === 'users' && <UserTable users={users} updateUsers={updateUsers} />}
        {activeTab === 'articles' && <ArticleTable articles={articles} updateArticles={updateArticles} />}
        {activeTab === 'comments' && <CommentTable comments={comments} updateComments={updateComments} />}
        {activeTab === 'themes' && <ThemeTable themes={themes} onEdit={handleThemeEdit} />}
      </div>
    </div>
  );
};

export default DashboardTabs;
