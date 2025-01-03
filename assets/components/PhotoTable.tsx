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

  // Debug : Vérifier les mises à jour des albums dans le composant
  useEffect(() => {
    console.log("Albums mis à jour dans PhotoTable :", albums);
  }, [albums]);

  // Supprimer une photo
  const handleDelete = (id: number, albumId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      fetch(`http://localhost:8000/photo/delete/${id}`, { method: "DELETE" })
        .then((response) => {
          if (response.ok) {
            // Mettre à jour la liste des photos
            onPhotosUpdate(photos.filter((photo) => photo.id !== id));

            // Recharger les albums pour synchroniser le state
            fetch("http://localhost:8000/albums_list")
              .then((res) => res.json())
              .then((updatedAlbums) => {
                console.log("Albums actualisés (après suppression) :", updatedAlbums); // Debug
                onAlbumsUpdate(updatedAlbums); // Mettre à jour les albums
              })
              .catch((error) =>
                console.error("Erreur lors de la récupération des albums :", error)
              );

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
    console.log("Édition de la photo ID:", id, "Nouveau titre:", newTitle); // Ajout d'un log pour déboguer
    fetch(`http://localhost:8000/photo/rename/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTitle }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Réponse du serveur après mise à jour de la photo");
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
              <td>
                {editingPhotoId === photo.id ? (
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)} // Mettre à jour le titre pendant l'édition
                    placeholder="Nouveau titre"
                  />
                ) : (
                  photo.title
                )}
              </td>
              <td>{photo.likesCount}</td>
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
                          setNewTitle(photo.title); // Pré-remplir le champ avec le titre actuel de la photo
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PhotoTable;
