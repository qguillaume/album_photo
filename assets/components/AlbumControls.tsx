import React, { useState } from "react";

interface AlbumControlsProps {
  albumId: number;
  albumName: string;
  onRename: (albumId: number, newName: string) => void;
  onDelete: (albumId: number) => void;
}

const AlbumControls: React.FC<AlbumControlsProps> = ({ albumId, albumName, onRename, onDelete }) => {
  const handleRename = () => {
    const newName = prompt(`Renommer l'album "${albumName}" :`, albumName);
    if (newName && newName.trim() !== "") {
      onRename(albumId, newName);
    }
  };

  const handleDelete = () => {
    if (confirm(`Voulez-vous vraiment supprimer l'album "${albumName}" ?`)) {
      onDelete(albumId);
    }
  };

  return (
    <div className="album-controls">
      <button className="btn-rename" onClick={handleRename}>
        ✏️
      </button>
      <button className="btn-delete" onClick={handleDelete}>
        ❌
      </button>
    </div>
  );
};

export default AlbumControls;
