import React, { useState, useEffect } from "react";
import { Photo, Album } from "../ts/types";
import Pagination from "./PaginationDashboard";

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
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const photosPerPage = 10; // Nombre de photos par page
  const isSuperAdmin = currentUserRoles.includes("ROLE_SUPER_ADMIN");
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

  // Gérer le tri par colonne
  const handleSort = (key: keyof Photo) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Fonction pour gérer la visibilité des photos
  const handleVisibilityChange = (photoId: number, newVisibility: boolean) => {
    fetch(`http://localhost:8000/photo/${photoId}/visibility`, {
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
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de la visibilité:", error);
      });
  };

  // Fonction pour gérer l'approbation des photos
  const handleApprovalChange = (photoId: number, newApproval: boolean) => {
    fetch(`http://localhost:8000/photo/${photoId}/approval`, {
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
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de l'approbation:", error);
      });
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(photos.length / photosPerPage);

  return (
    <div className="table-container">
      <h2>Liste des Photos</h2>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      <table className="dashboard-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("title")}>
              Titre de la photo {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("album")}>
              Album associé {sortConfig.key === "album" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("likesCount")}>
              Nombre de likes {sortConfig.key === "likesCount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("commentsCount")}>
              Nombre de commentaires {sortConfig.key === "commentsCount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Visibilité</th>
            {isSuperAdmin && (<th>Approbation</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPhotos.map((photo, index) => {
            const album = albums.find((a) => a.id === photo.albumId);

            // Applique une classe différente pour les lignes impaires et paires
            const rowClass = (index + 1) % 2 === 0 ? "even-row-photos" : "odd-row-photos"; 

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
                <td>{album ? album.nom : "Non associé"}</td>
                <td>{photo.likesCount}</td>
                <td>{photo.commentsCount || 0}</td>
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
                {isSuperAdmin && (<td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={photo.isApproved}
                    onChange={(e) => handleApprovalChange(photo.id, e.target.checked)}
                  />
                  <span className="slider"></span>
                  </label>
                </td>)}
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
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
    </div>
  );
};

export default PhotoTable;
