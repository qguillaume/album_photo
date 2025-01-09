import React, { useState } from "react";
import { Article } from "../ts/types";

interface ArticleTableProps {
  articles: Article[];
  onEdit: (id: number, newContent: string) => void;
  onDelete: (id: number) => void;
}

const ArticleTable: React.FC<ArticleTableProps> = ({ articles, onEdit, onDelete }) => {
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [newArticleContents, setNewArticleContents] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const articlesPerPage = 10; // Nombre d'articles par page

  // Calculer les articles à afficher pour la page courante
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

  // Changer de page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Déclencher la suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      onDelete(id);
    }
  };

  // Déclencher la validation de la modification
  const handleEdit = (id: number) => {
    onEdit(id, newArticleContents);
    setEditingArticleId(null);
    setNewArticleContents("");
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(articles.length / articlesPerPage);

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
          {currentArticles.map((article, index) => {
            const rowClass =
              (index + 1) % 2 === 0 ? "even-row-articles" : "odd-row-articles";

            return (
              <tr key={article.id} className={rowClass}>
                <td>{article.id}</td>
                <td>{article.title}</td>
                <td>{article.author.username}</td>
                <td>
                  {editingArticleId === article.id ? (
                    <input
                      type="text"
                      value={newArticleContents}
                      onChange={(e) => setNewArticleContents(e.target.value)}
                      placeholder="Nouveau contenu"
                    />
                  ) : article.content.length > 30 ? (
                    <>
                      {article.content.substring(0, 30) + "..."}{" "}
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
                  )}
                </td>
                <td>{new Date(article.createdAt).toLocaleString()}</td>
                <td>{new Date(article.updatedAt).toLocaleString()}</td>
                <td>{article.published ? "Oui" : "Non"}</td>
                <td className="td-actions">
                  <div className="crud-buttons">
                    {editingArticleId === article.id ? (
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

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
        >
          Précédent
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? "active" : ""}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => paginate(currentPage + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default ArticleTable;
