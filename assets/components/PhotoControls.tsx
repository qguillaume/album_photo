import React, { useState } from "react";

// Définir les types des props du composant
interface PhotoControlsProps {
  photoId: number;
  photoTitle: string;
  photoUrl: string;
  initialLikesCount: number;  // Compteur de likes initial
  onRename: (photoId: number, newName: string) => void;
  onDelete: (photoId: number) => void;
  onLike: (photoId: number) => void;  // Fonction de gestion du like
  photoPath: string;  // Chemin de la photo (fourni par Twig)
  isOwner: boolean;  // Indicateur si l'utilisateur est le propriétaire
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
  isOwner,
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

  return isOwner ? (
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
  ) : null;
};

export default PhotoControls;
