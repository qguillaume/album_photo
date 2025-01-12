import React, { useState } from "react";
import PhotoViewer from "./PhotoViewer";

interface PhotoControlsProps {
  photoId: number;
  photoTitle: string;
  photoUrl: string;
  initialLikesCount: number; // Compteur de likes initial
  onRename: (photoId: number, newName: string) => void;
  onDelete: (photoId: number) => void;
  onLike: (photoId: number) => void; // Fonction de gestion du like
  photoPath: string; // Chemin de la photo (fourni par Twig)
}

const PhotoControls: React.FC<PhotoControlsProps> = ({
  photoId,
  photoTitle,
  photoUrl,
  initialLikesCount,
  onRename,
  onDelete,
  onLike,
  photoPath,
}) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  // Gestion du "like"
  const handleLike = async () => {
    try {
      const response = await fetch(`/photo/${photoId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likes);
        onLike(photoId);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Une erreur est survenue.");
      }
    } catch (error) {
      alert("Une erreur est survenue lors de la tentative de like.");
    }
    // Ne pas recharger la page après le like, gérer l'état localement
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
        <button className="btn-like" onClick={handleLike}>
          ❤️ {likesCount}
        </button>
        <a href={photoPath} className="btn-view">
          👁️
        </a>
        <button className="btn-rename" onClick={handleRename}>
          ✏️
        </button>
        <button className="btn-delete" onClick={handleDelete}>
          ❌
        </button>
      </div>
    </div>
  );
};

export default PhotoControls;
