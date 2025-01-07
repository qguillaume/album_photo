import React, { useEffect, useState } from "react";
import { Photo, Album, User } from '../ts/types';

// AlbumTable.tsx
interface AlbumTableProps {
    albums: Album[]; // Les albums sont passés en props
    onAlbumsUpdate: (updatedAlbums: Album[]) => void;
  }
  
  const AlbumTable: React.FC<AlbumTableProps> = ({ albums, onAlbumsUpdate }) => {
    const [editingAlbumId, setEditingAlbumId] = useState<number | null>(null);
    const [newAlbumName, setNewAlbumName] = useState<string>("");
  
    // Supprimer un album
    const handleDelete = (id: number) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cet album ?")) {
        fetch(`/album/delete/${id}`, { method: "DELETE" })
          .then((response) => {
            if (response.ok) {
              const updatedAlbums = albums.filter((album) => album.id !== id);
              onAlbumsUpdate(updatedAlbums);
              alert("Album supprimé !");
            } else {
              alert("Erreur lors de la suppression.");
            }
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression de l'album :", error);
          });
      }
    };
  
    // Modifier un album
    const handleEdit = (id: number) => {
      fetch(`/album/rename/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAlbumName }),
      })
        .then((response) => {
          if (response.ok) {
            onAlbumsUpdate(
              albums.map((album) =>
                album.id === id ? { ...album, nom: newAlbumName } : album
              )
            );
            setEditingAlbumId(null);
            setNewAlbumName("");
            alert("Album mis à jour !");
          } else {
            alert("Erreur lors de la mise à jour de l'album.");
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour de l'album :", error);
        });
    };
  
    return (
      <div className="table-container">
        <h2>Liste des Albums</h2>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom de l'Album</th>
              <th>Nombre de Photos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album, index) => (
              <tr
                key={album.id}
                className={(index + 1) % 2 === 0 ? "even-row-albums" : "odd-row-albums"}
              >
                <td>{index + 1}</td>
                <td>
                  {editingAlbumId === album.id ? (
                    <input
                      type="text"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Nouveau nom"
                    />
                  ) : (
                    album.nom
                  )}
                </td>
                <td>{album.photos.length}</td>
                <td className="td-actions">
                  <div className="crud-buttons">
                    {editingAlbumId === album.id ? (
                      <>
                        <button className="validate" onClick={() => handleEdit(album.id)}>
                          Valider
                        </button>
                        <button
                          className="cancel"
                          onClick={() => setEditingAlbumId(null)}
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="edit"
                          onClick={() => {
                            setEditingAlbumId(album.id);
                            setNewAlbumName(album.nom);
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          className="delete"
                          onClick={() => handleDelete(album.id)}
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
  
  export default AlbumTable;
  
