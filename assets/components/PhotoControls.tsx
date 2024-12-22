import React, { useState } from "react";
import PhotoViewer from "./PhotoViewer"; // Importation du composant pour afficher la photo en grand

interface PhotoControlsProps {
  photoId: number;
  photoTitle: string;
  photoUrl: string;
  onView: (photoId: number) => void;
  onRename: (photoId: number, newName: string) => void;
  onDelete: (photoId: number) => void;
}

const PhotoControls: React.FC<PhotoControlsProps> = ({ photoId, photoTitle, photoUrl, onView, onRename, onDelete }) => {
  const [isViewerVisible, setIsViewerVisible] = useState(false); // Contrôler la visibilité du viewer
  const [currentPhoto, setCurrentPhoto] = useState({ url: "", title: "" });
  // Gestion de l'affichage de la photo
  const handleView = () => {
    setCurrentPhoto({ url: photoUrl, title: photoTitle });
    setIsViewerVisible(true);
  };

  // Fonction pour fermer le viewer
  const handleCloseViewer = () => {
    setIsViewerVisible(false);
  };

  const handleRename = () => {
    const newTitle = prompt(`Renommer la photo "${photoTitle}" :`, photoTitle);
    if (newTitle && newTitle.trim() !== "") {
      onRename(photoId, newTitle);
    }
  };

  const handleDelete = () => {
    if (confirm(`Voulez-vous vraiment supprimer la photo "${photoTitle}" ?`)) {
      onDelete(photoId);
    }
  };

  return (
    <div>
      <div className="photo-controls">
        <button className="btn-view" onClick={handleView}>
          👁️
        </button>
        <button className="btn-rename" onClick={handleRename}>
          ✏️
        </button>
        <button className="btn-delete" onClick={handleDelete}>
          ❌
        </button>
      </div>
      {isViewerVisible && (
        <div id="photo-viewer-container" className="photo-viewer-container">
          <PhotoViewer
            photoUrl={currentPhoto.url}
            photoTitle={currentPhoto.title}
            closeViewer={handleCloseViewer} // Passer la fonction de fermeture
          />
        </div>
      )}
    </div>
  );
};

export default PhotoControls;
