import React, { useState } from "react";
import PhotoControls from "./PhotoControls"; // Import du composant PhotoControls
import PhotoViewer from "./PhotoViewer"

interface Photo {
  id: number;
  title: string;
  filePath: string;
}

interface PhotoAlbumProps {
  photos: Photo[]; // Liste des photos de l'album
  onRename: (photoId: number, newName: string) => void; // Fonction pour renommer une photo
  onDelete: (photoId: number) => void; // Fonction pour supprimer une photo
}

const PhotoAlbum: React.FC<PhotoAlbumProps> = ({ photos, onRename, onDelete }) => {
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null); // Gérer la photo à afficher en grand

  const handleViewPhoto = (photoId: number) => {
    // Trouver la photo par ID et la définir comme photo à afficher
    const photo = photos.find((p) => p.id === photoId);
    if (photo) {
      setViewerPhoto(photo);
    }
  };

  const handleCloseViewer = () => {
    setViewerPhoto(null); // Fermer le viewer
  };

  return (
    <div>
      <h1>Photos de l'album</h1>
      <div className="photos-container">
        {photos.map((photo) => (
          <div key={photo.id} className="photo">
            <img
              src={photo.filePath}
              alt={photo.title}
              className="photo-thumbnail"
              onClick={() => handleViewPhoto(photo.id)} // Ouvre la photo en grand
            />
            <p>{photo.title}</p>
            <PhotoControls
              photoId={photo.id}
              photoTitle={photo.title}
              photoUrl={photo.filePath}
              onView={handleViewPhoto}
              onRename={onRename}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

      {/* Afficher le viewer si une photo est sélectionnée */}
      {viewerPhoto && (
        <div className="photo-viewer-overlay">
          <PhotoViewer
            photoUrl={viewerPhoto.filePath}
            photoTitle={viewerPhoto.title}
            closeViewer={handleCloseViewer}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoAlbum;
