import React, { useState } from "react";
import { Article } from "../ts/types";

interface ArticleTableProps {
  articles: Article[]; // Liste des articles
  onEdit: (id: number, newContent: string) => void; // Callback pour éditer un article
  onDelete: (id: number) => void; // Callback pour supprimer un article
}

const ArticleTable: React.FC<ArticleTableProps> = ({ articles, onEdit, onDelete }) => {
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null); // ID de l'article en cours d'édition
  const [newArticleContents, setNewArticleContents] = useState<string>(""); // Nouveau contenu de l'article

  // Déclencher la suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      onDelete(id); // Appeler la fonction passée en props
    }
  };

  // Déclencher la validation de la modification
  const handleEdit = (id: number) => {
    onEdit(id, newArticleContents); // Passer l'ID et le nouveau contenu
    setEditingArticleId(null); // Sortir du mode édition
    setNewArticleContents(""); // Réinitialiser le champ d'édition
  };

  return (
    <div className="table-container">
      <h2>Liste des Articles</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Auteur</th>
            <th>Contenu</th>
            <th>Créé le</th>
            <th>Modifié le</th>
            <th>Publié</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article, index) => {
            const rowClass =
              (index + 1) % 2 === 0 ? "even-row-articles" : "odd-row-articles";

            return (
              <tr key={article.id} className={rowClass}>
                <td>{article.id}</td>
                <td>{article.content}</td>
                <td>{article.author.username}</td>
                <td>
                  {editingArticleId === article.id ? (
                    // Mode édition : champ de saisie
                    <input
                      type="text"
                      value={newArticleContents}
                      onChange={(e) => setNewArticleContents(e.target.value)}
                      placeholder="Nouveau contenu"
                    />
                  ) : (
                    // Mode lecture
                    article.content.length > 50 ? (
                      <>
                        {article.content.substring(0, 50) + "..."}{" "}
                        <a
                          href={`/article/${article.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Voir plus
                        </a>
                      </>
                    ) : (
                      article.content
                    )
                  )}
                </td>
                <td>{new Date(article.createdAt).toLocaleString()}</td>
                <td>{new Date(article.updatedAt).toLocaleString()}</td>
                <td>{article.published ? "Oui" : "Non"}</td>
                <td className="td-actions">
                  <div className="crud-buttons">
                    {editingArticleId === article.id ? (
                      // Boutons en mode édition
                      <>
                        <button
                          className="validate"
                          onClick={() => handleEdit(article.id)}
                        >
                          Valider
                        </button>
                        <button
                          className="cancel"
                          onClick={() => setEditingArticleId(null)}
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
                            setEditingArticleId(article.id);
                            setNewArticleContents(article.content);
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          className="delete"
                          onClick={() => handleDelete(article.id)}
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

export default ArticleTable;
