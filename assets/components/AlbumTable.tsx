import React, { useState, useEffect } from "react";
import { Album, User } from '../ts/types';
import Pagination from "./PaginationDashboard";

// AlbumTable.tsx
interface AlbumTableProps {
  albums: Album[];
  users: User[];
  onAlbumsUpdate: (updatedAlbums: Album[]) => void;
}

const AlbumTable: React.FC<AlbumTableProps> = ({ albums, users, onAlbumsUpdate }) => {
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAlbumId, setEditingAlbumId] = useState<number | null>(null);
  const [newAlbumName, setNewAlbumName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const albumsPerPage = 10; // Nombre d'albums par page
  const isSuperAdmin = currentUserRoles.includes("ROLE_SUPER_ADMIN");
  const isAdmin = currentUserRoles.includes("ROLE_ADMIN");
  const isUser = currentUserRoles.includes("ROLE_USER");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Album; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/current_user");
        if (!response.ok) {
          throw new Error("Erreur dans la réponse de l'API");
        }
        const data = await response.json();
        setCurrentUserRoles(data.roles || []);
        setCurrentUserId(data.id);
      } catch (error) {
        console.error("Erreur lors de la récupération des rôles:", error);
      } finally {
        setLoading(false); // Désactive l'état de chargement
      }
    };

    fetchCurrentUser();
  }, []);

    if (loading) {
      return <div>Chargement...</div>; // Affiche un message pendant le chargement
    }

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
              album.id === id ? { ...album, nomAlbum: newAlbumName } : album
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

  // Fonction pour mettre à jour la visibilité
  const handleVisibilityChange = (albumId: number, isVisible: boolean) => {
    fetch(`/album/${albumId}/visibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible }),
    })
      .then((response) => {
        if (response.ok) {
          const updatedAlbums = albums.map((album) =>
            album.id === albumId ? { ...album, isVisible } : album
          );
          onAlbumsUpdate(updatedAlbums);
          alert(`Visibilité de l'album mise à jour avec succès !`);
        } else {
          alert("Erreur lors de la mise à jour de la visibilité.");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de la visibilité de l'album :", error);
      });
  };

  // Fonction pour gérer l'approbation des albums
  const handleApprovalChange = (albumId: number, newApproval: boolean) => {
    fetch(`http://localhost:8000/album/${albumId}/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: newApproval }),
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedAlbums = albums.map((album) =>
          album.id === albumId ? { ...album, isApproved: newApproval } : album
        );
        onAlbumsUpdate(updatedAlbums);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de l'approbation:", error);
      });
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(albums.length / albumsPerPage);
  const album = albums.find((a) => a.id === editingAlbumId);
  const albumCreatorId = album ? album.creator : 0;
            const canEditOrDelete =
            isSuperAdmin || 
            (isAdmin && (
              albumCreatorId === currentUserId || 
              (albumCreatorId !== currentUserId && users.find(user => user.id === albumCreatorId)?.roles.length === 1 && users.find(user => user.id === albumCreatorId)?.roles.includes('ROLE_USER'))
            )) || 
            (isUser && albumCreatorId === currentUserId);

  return (
    <div className="table-container">
      <h2>Liste des Albums</h2>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      <table className="dashboard-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("nomAlbum")}>
              Nom de l'album {sortConfig.key === "nomAlbum" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("creator")}>
              Créateur de l'album {sortConfig.key === "creator" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("photos")}>
              Nombre de photos contenu dans l'album {sortConfig.key === "photos" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            {isSuperAdmin && (<th>Approbation</th>)}
            {isSuperAdmin && (<th>Visibilité</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentAlbums.map((album, index) => (
            <tr key={album.id} className={index % 2 === 0 ? "even-row-albums" : "odd-row-albums"}>
              <td>{album.id}</td>
              <td>
                {editingAlbumId === album.id ? (
                  <input
                    type="text"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    placeholder="Nouveau nom"
                  />
                ) : (
                  album.nomAlbum
                )}
              </td>
              <td>{album.creator}</td>
              <td>{album.photos.length}</td>
              {isSuperAdmin && (<td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={album.isApproved}
                    onChange={(e) => handleApprovalChange(album.id, e.target.checked)}
                  />
                  <span className="slider"></span>
                  </label>
                </td>)}
                {isSuperAdmin && (<td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={album.isVisible}
                    onChange={(e) => handleVisibilityChange(album.id, e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </td>)}
              <td className="td-actions">
                <div className="crud-buttons">
                {canEditOrDelete && ( <>
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
                          setNewAlbumName(album.nomAlbum);
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
                  </>
                )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
    </div>
  );
};

export default AlbumTable;
