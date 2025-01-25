import React, { useState, useEffect } from "react";
import { Article } from "../ts/types";
import Pagination from "./PaginationDashboard";
import { useTranslation } from 'react-i18next';

interface ArticleTableProps {
  articles: Article[];
  updateArticles: () => void;
}

const ArticleTable: React.FC<ArticleTableProps> = ({ articles, updateArticles }) => {
  const { t } = useTranslation(); // Hook pour les traductions
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [newArticleContents, setNewArticleContents] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationClass, setNotificationClass] = useState<string>("");
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof Article; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  // Synchronisation de articleList avec comments
    useEffect(() => {
      setArticleList(articles);
    }, [articles]);

  // Fonction pour trier les articles
  const sortedArticles = [...articleList].sort((a, b) => {
    const aValue = a[sortConfig.key]?.toString() || '';
    const bValue = b[sortConfig.key]?.toString() || '';

    return sortConfig.direction === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Pagination : Calcul des indices de début et de fin des articles à afficher
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = sortedArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(articleList.length / articlesPerPage);

  // Changer de page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Gérer le tri par colonne
  const handleSort = (key: keyof Article) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Déclencher la suppression d'un article
  const handleDeleteArticle = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      fetch(`/article/${id}/delete`, { method: "POST" })
        .then((response) => {
          if (response.ok) {
            // Mettre à jour localement en supprimant l'article
            setArticleList((prevArticles) =>
              prevArticles.filter((article) => article.id !== id)
            );
            setNotification("Article supprimé avec succès !");
            setNotificationClass("show");
            setTimeout(() => setNotificationClass("hide"), 5000);
            // Appeler la fonction updateArticles pour synchroniser avec l'API
            updateArticles();
          } else {
            alert("Erreur lors de la suppression de l'article.");
          }
        })
        .catch((error) => console.error("Erreur:", error));
    }
  };

  // Déclencher la validation de la modification
  const handleEditArticle = (id: number, newContent: string) => {
    if (!newContent.trim()) {
      setNotification("Le contenu de l'article ne peut pas être vide");
      setNotificationClass("error");
      return;
    }

    fetch(`/article/${id}/edit_dashboard`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    })
      .then((response) => {
        if (response.ok) {
          // Mettre à jour localement avec le nouveau contenu
          setArticleList((prevArticles) =>
            prevArticles.map((article) =>
              article.id === id ? { ...article, content: newContent } : article
            )
          );
          setEditingArticleId(null);
          setNotification("Article mis à jour avec succès !");
          setNotificationClass("show");
          setTimeout(() => setNotificationClass("hide"), 5000);
          // Appeler la fonction updateArticles pour synchroniser avec l'API
          updateArticles();
        } else {
          alert("Erreur lors de la mise à jour de l'article.");
        }
      })
      .catch((error) => console.error("Erreur:", error));
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingArticleId(null);
    setNewArticleContents('');
  };

  return (
    <div className="table-container">
      <h2>{t("admin.articles_list")}</h2>
      
      {/* Pagination en haut */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />

      <table className="dashboard-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("title")}>
              {t("admin.article_title")} {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("author")}>
              {t("admin.username")} {sortConfig.key === "author" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>{t("admin.content")}</th>
            <th onClick={() => handleSort("createdAt")}>
              {t("admin.created_at")} {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("updatedAt")}>
              {t("admin.updated_at")} {sortConfig.key === "updatedAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("published")}>
              {t("admin.published")} {sortConfig.key === "published" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>{t("admin.actions")}</th>
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
                          onClick={() => handleEditArticle(article.id, newArticleContents)}
                        >
                          {t("admin.validate")}
                        </button>
                        <button
                          className="cancel"
                          onClick={handleCancelEdit}
                        >
                          {t("admin.cancel")}
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
                          {t("admin.update")}
                        </button>
                        <button
                          className="delete"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          {t("admin.delete")}
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

      {/* Affichage de la notification */}
      {notification && (
        <div className={`notification ${notificationClass}`}>
          {notification}
        </div>
      )}
    </div>
  );
};

export default ArticleTable;
