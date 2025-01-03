import React, { useState } from "react";
import { Photo } from "../ts/types";

interface PhotoTableProps {
  photos: Photo[];
  onPhotosUpdate: (updatedPhotos: Photo[]) => void; // Callback pour mettre à jour la liste des photos
}

const PhotoTable: React.FC<PhotoTableProps> = ({ photos, onPhotosUpdate }) => {
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  // Supprimer une photo
  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      fetch(`http://localhost:8000/photo/delete/${id}`, { method: "DELETE" })
        .then((response) => {
          if (response.ok) {
            onPhotosUpdate(photos.filter((photo) => photo.id !== id)); // Mettre à jour la liste des photos
            alert("Photo supprimée !");
          } else {
            alert("Erreur lors de la suppression.");
          }
        })
        .catch((error) =>
          console.error("Erreur lors de la suppression de la photo :", error)
        );
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
      <table className="photo-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Titre de la Photo</th>
            <th>Nombre de Likes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {photos.map((photo, index) => (
            <tr key={photo.id}>
              <td>{index + 1}</td>

              {/* Mode édition ou affichage */}
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

              <td>{photo.likesCount}</td>

              {/* Actions */}
              <td className="td-actions">
              <div className="crud-buttons">
                {editingPhotoId === photo.id ? (
                  <>
                    <button className="validate" onClick={() => handleEdit(photo.id)}>Valider</button>
                    <button className="cancel" onClick={() => setEditingPhotoId(null)}>
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button className="edit"
                      onClick={() => {
                        setEditingPhotoId(photo.id);
                        setNewTitle(photo.title); // Pré-remplir le champ
                      }}
                    >
                      Modifier
                    </button>
                    <button className="delete" onClick={() => handleDelete(photo.id)}>
                      Supprimer
                    </button>
                  </>
                )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PhotoTable;
