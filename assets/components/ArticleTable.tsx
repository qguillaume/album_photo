import React, { useState } from "react";
import { Article } from "../ts/types";
import Pagination from "./PaginationDashboard";

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
  const [sortConfig, setSortConfig] = useState<{ key: keyof Article; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  // Fonction pour trier les articles
  const sortedArticles = [...articles].sort((a, b) => {
    let aValue: any = a[sortConfig.key];
    let bValue: any = b[sortConfig.key];

    if (sortConfig.key === "author") {
      aValue = a.author.username;
      bValue = b.author.username;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Calculer les articles à afficher pour la page courante
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = sortedArticles.slice(indexOfFirstArticle, indexOfLastArticle);

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

  // Gérer le tri par colonne
  const handleSort = (key: keyof Article) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  return (
    <div className="table-container">
      <h2>Liste des Articles</h2>
      
      {/* Pagination en haut */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />

      <table className="dashboard-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("title")}>
              Titre {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("author")}>
              Auteur {sortConfig.key === "author" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Contenu</th>
            <th onClick={() => handleSort("createdAt")}>
              Créé le {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("updatedAt")}>
              Modifié le {sortConfig.key === "updatedAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("published")}>
              Publié {sortConfig.key === "published" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
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

      {/* Pagination en bas */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
    </div>
  );
};

export default ArticleTable;
