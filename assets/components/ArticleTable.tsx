import React, { useEffect, useState } from "react";
import { Article } from "../ts/types";

// On reçoit les articles en tant que props
interface ArticleTableProps {
    articles: Article[];
  }

  const ArticleTable: React.FC<ArticleTableProps> = ({ articles }) => {

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
             // Applique une classe différente pour les lignes impaires et paires
            const rowClass = (index + 1) % 2 === 0 ? "even-row-articles" : "odd-row-articles"; 
            return (
            <tr key={article.id} className={rowClass}>
              <td>{article.id}</td>
              <td>{article.title}</td>
              <td>{article.author.username}</td>
              <td>
              {article.content.length > 50 ? (
                <>
                  {article.content.substring(0, 50) + "..."}{" "}
                  <a href={`/article/${article.id}`} target="_blank" rel="noopener noreferrer">
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
              <td>
                <button>Modifier</button>
                <button>Supprimer</button>
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
