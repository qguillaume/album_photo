import React, { useState, useEffect } from 'react';
import { Comment } from '../ts/types';
import Pagination from './PaginationDashboard';

interface CommentTableProps {
  comments: Comment[];
  updateComments: () => void;
}

const CommentTable: React.FC<CommentTableProps> = ({ comments, updateComments }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationClass, setNotificationClass] = useState<string>('');

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [newCommentContents, setNewCommentContents] = useState<string>('');

  const [sortConfig, setSortConfig] = useState<{ key: keyof Comment; direction: 'asc' | 'desc' }>({
    key: 'id',
    direction: 'asc',
  });

  // Synchronisation de commentList avec comments
  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  // Fonction pour trier les commentaires
  const sortedComments = [...commentList].sort((a, b) => {
    const aValue = a[sortConfig.key]?.toString() || '';
    const bValue = b[sortConfig.key]?.toString() || '';

    return sortConfig.direction === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Pagination : Calcul des indices de début et de fin des commentaires à afficher
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = sortedComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(commentList.length / commentsPerPage);

  // Changer de page pour la pagination
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Gestion du tri
  const handleSort = (key: keyof Comment) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Modifier un commentaire
  const handleCommentEdit = (id: number, newContent: string) => {
    if (!newContent.trim()) {
      setNotification('Le contenu du commentaire ne peut pas être vide');
      setNotificationClass('error');
      return;
    }

    fetch(`/comment/${id}/edit_dashboard`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent }),
    })
      .then((response) => {
        if (response.ok) {
          updateComments();
          setEditingCommentId(null);
          // Afficher la notification de succès
          setNotification("Commentaire mis à jour avec succès !");
          setNotificationClass("show");

          // Cacher la notification après 5 secondes avec animation
          setTimeout(() => setNotificationClass("hide"), 5000);
        } else {
          alert('Erreur lors de la mise à jour du commentaire.');
        }
      })
      .catch((error) => console.error('Erreur:', error));
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setNewCommentContents('');
  };

  // Supprimer un commentaire
  const handleDeleteComment = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
    fetch(`/comment/${id}/delete_dashboard`, { method: 'DELETE' })
      .then((response) => {
        if (response.ok) {
          updateComments();
          // Afficher la notification de succès
          setNotification("Commentaire supprimé avec succès !");
          setNotificationClass("show");

          // Cacher la notification après 5 secondes avec animation
          setTimeout(() => setNotificationClass("hide"), 5000);
        } else {
          alert('Erreur lors de la suppression du commentaire.');
        }
      })
      .catch((error) => console.error('Erreur:', error));
    }
  };

  return (
    <div className="table-container">
      <h2>Liste des Commentaires</h2>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      <table className="dashboard-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>
              ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                  {editingCommentId === comment.id ? (
                    <div className="crud-buttons">
                      <button className="validate" onClick={() => handleCommentEdit(comment.id, newCommentContents)}>
                        Valider
                      </button>
                      <button className="cancel" onClick={handleCancelEdit}>
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="crud-buttons">
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
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination en bas */}
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

export default CommentTable;
