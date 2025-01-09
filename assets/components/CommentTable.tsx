import React, { useState } from "react";
import { Comment } from "../ts/types";

interface CommentTableProps {
  comments: Comment[]; // Liste des commentaires
  onEdit: (id: number, newContent: string) => void; // Callback pour éditer un commentaire
  onDelete: (id: number) => void; // Callback pour supprimer un commentaire
}

const CommentTable: React.FC<CommentTableProps> = ({ comments, onEdit, onDelete }) => {
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // ID du commentaire en cours d'édition
  const [newCommentContents, setNewCommentContents] = useState<string>(""); // Nouveau texte du commentaire

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

  return (
    <div className="table-container">
      <h2>Liste des Commentaires</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Utilisateur</th>
            <th>Contenu</th>
            <th>Photo concernée</th>
            <th>Créé le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment, index) => {
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
    </div>
  );
};

export default CommentTable;
