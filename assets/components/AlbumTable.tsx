import React, { useState, useEffect } from "react";
import { Album, User } from '../ts/types';
import Pagination from "./PaginationDashboard";
import { useTranslation } from 'react-i18next';

// AlbumTable.tsx
interface AlbumTableProps {
  albums: Album[];
  users: User[];
  onAlbumsUpdate: (updatedAlbums: Album[]) => void;
}

const AlbumTable: React.FC<AlbumTableProps> = ({ albums, users, onAlbumsUpdate }) => {
  const { t } = useTranslation(); // Hook pour les traductions
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
  const [notification, setNotification] = useState<string | null>(null); // Ajout de l'état pour la notification
  const [notificationClass, setNotificationClass] = useState<string>(""); // Ajout pour gérer les classes CSS
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
      return <div>{t('admin.loading')}</div>; // Affiche un message pendant le chargement
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
            // Afficher la notification de succès
            setNotification("Album supprimé avec succès.");
            setNotificationClass("show"); // Afficher la notification

            // Cacher la notification après 5 secondes avec animation
            setTimeout(() => setNotificationClass("hide"), 5000);
            //alert("Album supprimé !");
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
          // Afficher la notification de succès
          setNotification("L'album a été mis à jour avec succès.");
          setNotificationClass("show"); // Afficher la notification

          // Cacher la notification après 5 secondes avec animation
          setTimeout(() => setNotificationClass("hide"), 5000);
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
          // Afficher la notification de succès
          setNotification("Visibilité de l'album mise à jour avec succès !");
          setNotificationClass("show"); // Afficher la notification

          // Cacher la notification après 5 secondes avec animation
          setTimeout(() => setNotificationClass("hide"), 5000);
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
    fetch(`/album/${albumId}/approval`, {
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
        // Afficher la notification de succès
        setNotification("Approbation de l'album mise à jour avec succès !");
        setNotificationClass("show"); // Afficher la notification

        // Cacher la notification après 5 secondes avec animation
        setTimeout(() => setNotificationClass("hide"), 5000);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de l'approbation:", error);
      });
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(albums.length / albumsPerPage);

  // Fonction pour obtenir le nom de l'utilisateur à partir de l'ID
  const getUserNameById = (userId: number) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.username : "Inconnu";
  };

  // Vérification des permissions d'affichage des boutons (Admin, SuperAdmin, User)
  const canEditOrDelete = (albumCreatorId: number) => {
    return (
      isSuperAdmin || 
      (isAdmin && 
        (albumCreatorId === currentUserId || 
          (albumCreatorId !== currentUserId && 
            users.find((user) => user.id === albumCreatorId)?.roles.length === 1 &&
            users.find((user) => user.id === albumCreatorId)?.roles.includes("ROLE_USER")
          )
        )
      ) || 
      (isUser && albumCreatorId === currentUserId)
    );
  };

  return (
    <div className="table-container">
      <h2>{t("admin.albums_list")}</h2>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      <table className="dashboard-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("nomAlbum")}>
            {t('admin.album_name')} {sortConfig.key === "nomAlbum" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("creator")}>
            {t('admin.album_creator')} {sortConfig.key === "creator" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("photos")}>
            {t('admin.photos_number')} {sortConfig.key === "photos" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            {(isSuperAdmin || isAdmin) && (<th>{t('admin.approve')}</th>)}
            {(isSuperAdmin || isAdmin) && (<th>{t('admin.visible')}</th>)}
            <th>{t('admin.actions')}</th>
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
              <td>{getUserNameById(album.creator)}</td>
              <td>{album.photos.length}</td>
                <>
                  <td>
                    {canEditOrDelete(album.creator) && (
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={album.isApproved}
                        onChange={(e) => handleApprovalChange(album.id, e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                    )}
                  </td>
                  
                  <td>{canEditOrDelete(album.creator) && (
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={album.isVisible}
                        onChange={(e) => handleVisibilityChange(album.id, e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                    )}
                  </td>
                </>
              <td className="td-actions">
                <div className="crud-buttons">
                  {canEditOrDelete(album.creator) && (
                    <>
                      {editingAlbumId === album.id ? (
                        <>
                          <button className="validate" onClick={() => handleEdit(album.id)}>
                          {t('admin.validate')}
                          </button>
                          <button className="cancel" onClick={() => setEditingAlbumId(null)}>
                          {t('admin.cancel')}
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
                            {t('admin.update')}
                          </button>
                          <button className="delete" onClick={() => handleDelete(album.id)}>
                          {t('admin.delete')}
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
      {/* Affichage de la notification en bas à gauche */}
      {notification && (
        <div className={`notification ${notificationClass}`}>
          {notification}
        </div>
      )}
    </div>
  );
};

export default AlbumTable;
