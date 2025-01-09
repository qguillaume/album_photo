import React, { useState } from "react";
import { Comment } from "../ts/types";
import Pagination from "./PaginationDashboard";

interface CommentTableProps {
  comments: Comment[]; // Liste des commentaires
  onEdit: (id: number, newContent: string) => void; // Callback pour éditer un commentaire
  onDelete: (id: number) => void; // Callback pour supprimer un commentaire
}

const CommentTable: React.FC<CommentTableProps> = ({ comments, onEdit, onDelete }) => {
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // ID du commentaire en cours d'édition
  const [newCommentContents, setNewCommentContents] = useState<string>(""); // Nouveau texte du commentaire
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const commentsPerPage = 10; // Nombre de commentaires par page
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof Comment; direction: "asc" | "desc" }>({
      key: "id",
      direction: "asc",
    });
  
    // Fonction pour trier les commentaires
    const sortedComments = [...comments].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];
  
      if (sortConfig.key === "user") {
        aValue = a.user.username;
        bValue = b.user.username;
      }
  
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    // Calculer les commentaires à afficher pour la page courante
    const indexOfLastComments = currentPage * commentsPerPage;
    const indexOfFirstComments = indexOfLastComments - commentsPerPage;
    const currentComments = sortedComments.slice(indexOfFirstComments, indexOfLastComments);

  // Changer de page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Déclencher la suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      onDelete(id); // Appeler la fonction passée en props
    }
  };

  // Déclencher la validation de la modification
  const handleEdit = (id: number) => {
    onEdit(id, newCommentContents); // Passer l'ID et le nouveau contenu
    setEditingCommentId(null); // Sortir du mode édition
    setNewCommentContents(""); // Réinitialiser le champ d'édition
  };

    // Gérer le tri par colonne
    const handleSort = (key: keyof Comment) => {
      setSortConfig((prevConfig) => ({
        key,
        direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
      }));
    };
  
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(comments.length / commentsPerPage);

  return (
    <div className="table-container">
      <h2>Liste des Commentaires</h2>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      <table className="dashboard-table">
        <thead>
          <tr>
          <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("user")}>
              Utilisateur {sortConfig.key === "user" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Contenu</th>
            <th onClick={() => handleSort("photo")}>
              Photo concernée {sortConfig.key === "photo" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("createdAt")}>
              Créé le {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentComments.map((comment, index) => {
            const rowClass =
              (index + 1) % 2 === 0 ? "even-row-comments" : "odd-row-comments";

            return (
              <tr key={comment.id} className={rowClass}>
                <td>{comment.id}</td>
                <td>{comment.user.username}</td>
                <td>
                  {editingCommentId === comment.id ? (
                    // Mode édition : champ de saisie
                    <input
                      type="text"
                      value={newCommentContents}
                      onChange={(e) => setNewCommentContents(e.target.value)}
                      placeholder="Nouveau commentaire"
                    />
                  ) : (
                    // Mode lecture
                    comment.content.length > 30 ? (
                      <>
                        {comment.content.substring(0, 30) + "..."}{" "}
                        <a
                          href={`/comment/${comment.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Voir plus
                        </a>
                      </>
                    ) : (
                        comment.content
                    )
                  )}
                </td>
                <td>{comment.photo.title}</td>
                <td>{new Date(comment.createdAt).toLocaleString()}</td>
                <td className="td-actions">
                  <div className="crud-buttons">
                    {editingCommentId === comment.id ? (
                      // Boutons en mode édition
                      <>
                        <button
                          className="validate"
                          onClick={() => handleEdit(comment.id)}
                        >
                          Valider
                        </button>
                        <button
                          className="cancel"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      // Boutons en mode lecture
                      <>
                        <button
                          className="edit"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setNewCommentContents(comment.content);
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          className="delete"
                          onClick={() => handleDelete(comment.id)}
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
      {/* Pagination en bas */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
    </div>
  );
};

export default CommentTable;
