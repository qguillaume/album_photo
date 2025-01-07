import React, { useState, useEffect } from "react";
import { Photo, Album } from "../ts/types";

interface PhotoTableProps {
  photos: Photo[];
  albums: Album[];
  onPhotosUpdate: (updatedPhotos: Photo[]) => void;
  onAlbumsUpdate: (updatedAlbums: Album[]) => void;
}

const PhotoTable: React.FC<PhotoTableProps> = ({
  photos,
  albums,
  onPhotosUpdate,
  onAlbumsUpdate,
}) => {
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  // Supprimer une photo
  const handleDelete = (id: number, albumId: number | undefined) => {
    console.log(`Suppression demandée pour la photo ID: ${id}, Album ID: ${albumId}`);

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      fetch(`http://localhost:8000/photo/delete/${id}`, { method: "DELETE" })
        .then((response) => {
          if (response.ok) {
            const updatedPhotos = photos.filter((photo) => photo.id !== id);
            onPhotosUpdate(updatedPhotos);

            if (albumId) {
              const updatedAlbums = albums.map((album) =>
                album.id === albumId
                  ? {
                      ...album,
                      photos: album.photos.filter((photo) => photo.id !== id),
                    }
                  : album
              );
              onAlbumsUpdate(updatedAlbums);
            }

            alert("Photo supprimée !");
          } else {
            alert("Erreur lors de la suppression.");
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression de la photo :", error);
        });
    }
  };

  // Modifier une photo
  const handleEdit = (id: number) => {
    fetch(`http://localhost:8000/photo/rename/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTitle }),
    })
      .then((response) => {
        if (response.ok) {
          onPhotosUpdate(
            photos.map((photo) =>
              photo.id === id ? { ...photo, title: newTitle } : photo
            )
          );
          setEditingPhotoId(null); // Fermer le mode d'édition
          setNewTitle(""); // Réinitialiser le titre
          alert("Photo mise à jour !");
        } else {
          alert("Erreur lors de la mise à jour.");
        }
      })
      .catch((error) =>
        console.error("Erreur lors de la mise à jour de la photo :", error)
      );
  };

  return (
    <div className="table-container">
      <h2>Top Photos par Likes</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Titre de la Photo</th>
            <th>Album associé</th>
            <th>Nombre de Likes</th>
            <th>Nombre de Commentaires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {photos.map((photo, index) => {
            const album = albums.find((a) => a.id === photo.albumId);

            // Applique une classe différente pour les lignes impaires et paires
            const rowClass = (index + 1) % 2 === 0 ? "even-row-photos" : "odd-row-photos"; 

            return (
              <tr key={photo.id} className={rowClass}>
                <td>{index + 1}</td>
                <td>
                  {editingPhotoId === photo.id ? (
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Nouveau titre"
                    />
                  ) : (
                    photo.title
                  )}
                </td>
                <td>{photo.album}</td>
                <td>{photo.likesCount}</td>
                <td>{photo.commentsCount || 0}</td>
                <td className="td-actions">
                  <div className="crud-buttons">
                    {editingPhotoId === photo.id ? (
                      <>
                        <button
                          className="validate"
                          onClick={() => handleEdit(photo.id)}
                        >
                          Valider
                        </button>
                        <button
                          className="cancel"
                          onClick={() => setEditingPhotoId(null)}
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="edit"
                          onClick={() => {
                            setEditingPhotoId(photo.id);
                            setNewTitle(photo.title);
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          className="delete"
                          onClick={() => handleDelete(photo.id, photo.albumId)}
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PhotoTable;
