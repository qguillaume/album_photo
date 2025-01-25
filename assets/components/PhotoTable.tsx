import React, { useState, useEffect } from "react";
import { Photo, Album, User } from "../ts/types";
import Pagination from "./PaginationDashboard";
import { useTranslation } from 'react-i18next';

interface PhotoTableProps {
  photos: Photo[];
  albums: Album[];
  users: User[];
  onPhotosUpdate: (updatedPhotos: Photo[]) => void;
  onAlbumsUpdate: (updatedAlbums: Album[]) => void;
}

const PhotoTable: React.FC<PhotoTableProps> = ({
  photos,
  albums,
  users,
  onPhotosUpdate,
  onAlbumsUpdate,
}) => {
  const { t } = useTranslation(); // Hook pour les traductions
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const photosPerPage = 10; // Nombre de photos par page
  const isSuperAdmin = currentUserRoles.includes("ROLE_SUPER_ADMIN");
  const isAdmin = currentUserRoles.includes("ROLE_ADMIN");
  const isUser = currentUserRoles.includes("ROLE_USER");
  const [notification, setNotification] = useState<string | null>(null); // Ajout de l'état pour la notification
  const [notificationClass, setNotificationClass] = useState<string>(""); // Ajout pour gérer les classes CSS
  const [sortConfig, setSortConfig] = useState<{ key: keyof Photo; direction: "asc" | "desc" }>({
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
    return <div>{t("admin.loading")}</div>;
  }

  // Fonction pour trier les photos
  const sortedPhotos = [...photos].sort((a, b) => {
    let aValue: any = a[sortConfig.key];
    let bValue: any = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Calculer les photos à afficher pour la page courante
  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
  const currentPhotos = sortedPhotos.slice(indexOfFirstPhoto, indexOfLastPhoto);

  // Changer de page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Supprimer une photo
  const handleDelete = (id: number, albumId: number | undefined, albumCreatorId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      fetch(`/photo/delete/${id}`, { method: "DELETE" })
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
  
            // Afficher la notification de succès
            setNotification("Photo supprimée avec succès !");
            setNotificationClass("show"); // Afficher la notification

            // Cacher la notification après 5 secondes avec animation
            setTimeout(() => setNotificationClass("hide"), 5000);
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
    fetch(`/photo/rename/${id}`, {
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
          // Afficher la notification de succès
          setNotification("Photo mise à jour avec succès !");
          setNotificationClass("show"); // Afficher la notification

          // Cacher la notification après 5 secondes avec animation
          setTimeout(() => setNotificationClass("hide"), 5000);
        } else {
          alert("Erreur lors de la mise à jour.");
        }
      })
      .catch((error) =>
        console.error("Erreur lors de la mise à jour de la photo :", error)
      );
  };

  // Gérer le tri par colonne
  const handleSort = (key: keyof Photo) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Fonction pour gérer la visibilité des photos
  const handleVisibilityChange = (photoId: number, newVisibility: boolean) => {
    fetch(`/photo/${photoId}/visibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: newVisibility }),
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedPhotos = photos.map((photo) =>
          photo.id === photoId ? { ...photo, isVisible: newVisibility } : photo
        );
        onPhotosUpdate(updatedPhotos);
        // Afficher la notification de succès
        setNotification("Visibilité de la photo mise à jour avec succès !");
        setNotificationClass("show"); // Afficher la notification

        // Cacher la notification après 5 secondes avec animation
        setTimeout(() => setNotificationClass("hide"), 5000);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de la visibilité:", error);
      });
  };

  // Fonction pour gérer l'approbation des photos
  const handleApprovalChange = (photoId: number, newApproval: boolean) => {
    fetch(`/photo/${photoId}/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: newApproval }),
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedPhotos = photos.map((photo) =>
          photo.id === photoId ? { ...photo, isApproved: newApproval } : photo
        );
        onPhotosUpdate(updatedPhotos);
        // Afficher la notification de succès
        setNotification("Approbation de la photo mise à jour avec succès !");
        setNotificationClass("show"); // Afficher la notification

        // Cacher la notification après 5 secondes avec animation
        setTimeout(() => setNotificationClass("hide"), 5000);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de l'approbation:", error);
      });
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(photos.length / photosPerPage);

  return (
    <div className="table-container">
      <h2>{t("admin.photos_list")}</h2>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      <table className="dashboard-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("title")}>
              {t("admin.photo_title")} {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("album")}>
              {t("admin.associate_album")} {sortConfig.key === "album" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("likesCount")}>
              {t("admin.likes_number")} {sortConfig.key === "likesCount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("commentsCount")}>
              {t("admin.comments_number")} {sortConfig.key === "commentsCount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            {(isSuperAdmin || isAdmin) && (<th>Approbation</th>)}
            <th>{t("admin.visible")}</th>
            <th>{t("admin.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {currentPhotos.map((photo, index) => {
            const album = albums.find((a) => a.photos.some((photoInAlbum) => photoInAlbum.id === photo.id));
            const rowClass = (index + 1) % 2 === 0 ? "even-row-photos" : "odd-row-photos";
            const albumCreatorId = album ? album.creator : 0;
            const canEditOrDelete =
            isSuperAdmin || 
            (isAdmin && (
              albumCreatorId === currentUserId || 
              (albumCreatorId !== currentUserId && users.find(user => user.id === albumCreatorId)?.roles.length === 1 && users.find(user => user.id === albumCreatorId)?.roles.includes('ROLE_USER'))
            )) || 
            (isUser && albumCreatorId === currentUserId);

            return (
              <tr key={photo.id} className={rowClass}>
                <td>{photo.id}</td>
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
                <td>{album ? album.nomAlbum : "Non associé"}</td>
                <td>{photo.likesCount}</td>
                <td>{photo.commentsCount || 0}</td>
                {(isSuperAdmin || isAdmin) && (
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={photo.isApproved}
                      onChange={(e) => handleApprovalChange(photo.id, e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                )}
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={photo.isVisible}
                        onChange={(e) => handleVisibilityChange(photo.id, e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                
                <td className="td-actions">
                  <div className="crud-buttons">
                    {canEditOrDelete && (
                      <>
                        {editingPhotoId === photo.id ? (
                          <>
                            <button
                              className="validate"
                              onClick={() => handleEdit(photo.id)}
                            >
                              {t("admin.validate")}
                            </button>
                            <button
                              className="cancel"
                              onClick={() => setEditingPhotoId(null)}
                            >
                              {t("admin.cancel")}
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
                              {t("admin.update")}
                            </button>
                            <button
                              className="delete"
                              onClick={() => handleDelete(photo.id, photo.albumId, albumCreatorId || 0)}
                            >
                              {t("admin.delete")}
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
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

export default PhotoTable;
