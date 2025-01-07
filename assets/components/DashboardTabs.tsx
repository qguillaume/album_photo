import React, { useState, useEffect } from 'react';
import AlbumTable from './AlbumTable';
import PhotoTable from './PhotoTable';
import UserTable from './UserTable';
import { Photo, Album, User } from '../ts/types';

const DashboardTabs: React.FC = () => {
  // L'état pour savoir quel onglet est sélectionné
  const [activeTab, setActiveTab] = useState<'albums' | 'photos' | 'users'>('albums');
  
  // États pour stocker les photos, albums et utilisateurs
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
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
  }, [photos, albums, users]); // Assurer que la requête n'est effectuée qu'une fois par type de données

  // Fonction pour changer d'onglet
  const handleTabClick = (tab: 'albums' | 'photos' | 'users') => {
    setActiveTab(tab);
  };

  const handlePhotosUpdate = (updatedPhotos: Photo[]) => {
    setPhotos(updatedPhotos);
  };

  const handleAlbumsUpdate = (updatedAlbums: Album[]) => {
    setAlbums(updatedAlbums);
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
      </div>
    </div>
  );
};

export default DashboardTabs;
