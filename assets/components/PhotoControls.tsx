import React, { useState } from "react";
import PhotoViewer from "./PhotoViewer";

interface PhotoControlsProps {
  photoId: number;
  photoTitle: string;
  photoUrl: string;
  initialLikesCount: number;  // Compteur de likes initial
  onView: (photoId: number) => void;
  onRename: (photoId: number, newName: string) => void;
  onDelete: (photoId: number) => void;
  onLike: (photoId: number) => void;  // Fonction de gestion du like
}

const PhotoControls: React.FC<PhotoControlsProps> = ({
  photoId,
  photoTitle,
  photoUrl,
  initialLikesCount,
  onView,
  onRename,
  onDelete,
  onLike,
}) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount);  // Suivi du nombre de likes
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState({ url: "", title: "" });

  // Gestion du "like"
  const handleLike = async () => {
    try {
      const response = await fetch(`/photo/${photoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likes);  // Mettre à jour le nombre de likes
        onLike(photoId);  // Appeler la fonction "onLike" pour informer le parent
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Une erreur est survenue.');
      }
    } catch (error) {
      alert('Une erreur est survenue lors de la tentative de like.');
    }
    // Ne pas recharger la page après le like, gérer l'état localement
  };

  const handleView = () => {
    setCurrentPhoto({ url: photoUrl, title: photoTitle });
    setIsViewerVisible(true);
  };

  const handleCloseViewer = () => {
    setIsViewerVisible(false);
  };

  const handleRename = () => {
    const newTitle = prompt(`Renommer la photo "${photoTitle}" :`, photoTitle);
    if (newTitle && newTitle.trim() !== "") {
      onRename(photoId, newTitle);
      // Mettez à jour l'état local si nécessaire sans recharger la page
      // Exemple :
      // setPhotoTitle(newTitle); ou autre
    }
  };

  const handleDelete = () => {
    if (confirm(`Voulez-vous vraiment supprimer la photo "${photoTitle}" ?`)) {
      onDelete(photoId);
      // Recharger l'état local si nécessaire sans recharger la page
      // Exemple :
      // setPhotos(filteredPhotos); ou autre
    }
  };

  return (
    <div>
      <div className="photo-controls">
        <button className="btn-view" onClick={handleView}>👁️</button>
        <button className="btn-rename" onClick={handleRename}>✏️</button>
        <button className="btn-delete" onClick={handleDelete}>❌</button>
        
        {/* Bouton Like */}
        <button className="btn-like" onClick={handleLike}>
          ❤️ {likesCount}
        </button>
      </div>

      {isViewerVisible && (
        <div id="photo-viewer-container" className="photo-viewer-container">
          <PhotoViewer
            photoUrl={currentPhoto.url}
            photoTitle={currentPhoto.title}
            closeViewer={handleCloseViewer}  // Passer la fonction de fermeture
          />
        </div>
      )}
    </div>
  );
};

export default PhotoControls;
