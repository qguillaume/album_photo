import React, { useState } from "react";

interface AlbumControlsProps {
  albumId: number;
  albumName: string;
  onRename: (albumId: number, newName: string) => void;
  onDelete: (albumId: number) => void;
}

const AlbumControls: React.FC<AlbumControlsProps> = ({
  albumId,
  albumName,
  onRename,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(albumName);

  const handleRename = () => {
    onRename(albumId, newName);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'album "${albumName}" ?`)) {
      onDelete(albumId);
    }
  };

  return (
    <div className="album-controls">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={handleRename}>Confirmer</button>
          <button onClick={() => setIsEditing(false)}>Annuler</button>
        </div>
      ) : (
        <div>
          <button onClick={() => setIsEditing(true)}>Modifier</button>
          <button onClick={handleDelete}>Supprimer</button>
        </div>
      )}
    </div>
  );
};

export default AlbumControls;
