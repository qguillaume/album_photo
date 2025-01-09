import React, { useEffect, useState } from "react";
import { Photo, Album, User } from '../ts/types';
import Pagination from "./PaginationDashboard";

// AlbumTable.tsx
interface AlbumTableProps {
    albums: Album[]; // Les albums sont passés en props
    onAlbumsUpdate: (updatedAlbums: Album[]) => void;
  }
  
  const AlbumTable: React.FC<AlbumTableProps> = ({ albums, onAlbumsUpdate }) => {
    const [editingAlbumId, setEditingAlbumId] = useState<number | null>(null);
    const [newAlbumName, setNewAlbumName] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1); // Page actuelle
    const albumsPerPage = 10; // Nombre d'albums par page

    const [sortConfig, setSortConfig] = useState<{ key: keyof Album; direction: "asc" | "desc" }>({
        key: "id",
        direction: "asc",
      });
    
      // Fonction pour trier les albums
      const sortedAlbums = [...albums].sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];
    
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });

    // Calculer les albums à afficher pour la page courante
    const indexOfLastAlbum = currentPage * albumsPerPage;
    const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
    const currentAlbums = sortedAlbums.slice(indexOfFirstAlbum, indexOfLastAlbum);

    // Changer de page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
  
      // Gérer le tri par colonne
      const handleSort = (key: keyof Album) => {
        setSortConfig((prevConfig) => ({
          key,
          direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
        }));
      };
    
      // Calculer le nombre total de pages
      const totalPages = Math.ceil(albums.length / albumsPerPage);

    return (
      <div className="table-container">
        <h2>Liste des Albums</h2>
        {/* Pagination en haut */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
        <table className="dashboard-table">
          <thead>
            <tr>
            <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("nom")}>
              Nom de l'album {sortConfig.key === "nom" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("photos")}>
              Nombre de photos contenu dans l'album {sortConfig.key === "photos" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            
            {currentAlbums.map((album, index) => (
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
        {/* Pagination en bas */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      </div>
    );
  };
  
  export default AlbumTable;
  
