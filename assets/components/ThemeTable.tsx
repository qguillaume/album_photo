import React, { useState, useEffect } from "react";
import Pagination from "./PaginationDashboard";
import { Theme } from "../ts/types";
import { useTranslation } from 'react-i18next';

interface ThemeTableProps {
  themes: Theme[];
  onEdit: (themeId: number, newName: string) => void;
}

const ThemeTable: React.FC<ThemeTableProps> = ({ themes, onEdit }) => {
  const { t } = useTranslation(); // Hook pour les traductions
  const [currentPage, setCurrentPage] = useState(1);
  const themesPerPage = 10;
  const [themeList, setThemeList] = useState<Theme[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationClass, setNotificationClass] = useState<string>("");

  const [editingThemeId, setEditingThemeId] = useState<number | null>(null);
  const [newThemeName, setNewThemeName] = useState<string>("");

  const [sortConfig, setSortConfig] = useState<{ key: keyof Theme; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  // Synchronisation de themeList avec themes
  useEffect(() => {
    setThemeList(themes);
  }, [themes]);

  // Gestion du tri
  const sortedThemes = [...themeList].sort((a, b) => {
    const aValue = a[sortConfig.key]?.toString() || "";
    const bValue = b[sortConfig.key]?.toString() || "";

    return sortConfig.direction === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Pagination
  const indexOfLastTheme = currentPage * themesPerPage;
  const indexOfFirstTheme = indexOfLastTheme - themesPerPage;
  const currentThemes = sortedThemes.slice(indexOfFirstTheme, indexOfLastTheme);
  const totalPages = Math.ceil(themeList.length / themesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Gestion du tri
  const handleSort = (key: keyof Theme) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Mise à jour du thème
  const handleEdit = (themeId: number) => {
    if (!newThemeName.trim()) {
      setNotification("Le nom du thème ne peut pas être vide");
      setNotificationClass("error");
      return;
    }
    
    // Mettre à jour le thème dans le tableau local
    const updatedThemes = themeList.map((theme) =>
      theme.id === themeId ? { ...theme, name: newThemeName } : theme
    );
    setThemeList(updatedThemes); // Met à jour la liste des thèmes
    
    // Réinitialiser les états
    setEditingThemeId(null); // Quitte le mode édition
    setNewThemeName(""); // Réinitialise l'entrée
    setNotification("Nom du thème mis à jour avec succès.");
    setNotificationClass("success");
  
    // Appeler la fonction onEdit passée en prop
    onEdit(themeId, newThemeName);
  };

  return (
    <div className="table-container">
      <h2>{t("admin.themes_list")}</h2>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      <table className="dashboard-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("name")}>
            {t("admin.theme_name")} {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>{t("admin.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {currentThemes.map((theme, index) => {
            const rowClass = (index + 1) % 2 === 0 ? "even-row-themes" : "odd-row-themes";

            return (
              <tr key={theme.id} className={rowClass}>
                <td>{theme.id}</td>
                <td>
                  {editingThemeId === theme.id ? (
                    <input
                      type="text"
                      value={newThemeName}
                      onChange={(e) => setNewThemeName(e.target.value)}
                    />
                  ) : (
                    theme.name || "Nom non disponible"
                  )}
                </td>
                <td className="td-actions">
                  <div className="crud-buttons">
                    {editingThemeId === theme.id ? (
                      <>
                        <button className="validate" onClick={() => handleEdit(theme.id)}>
                        {t("admin.validate")}
                        </button>
                        <button className="cancel" onClick={() => setEditingThemeId(null)}>
                        {t("admin.cancel")}
                        </button>
                      </>
                    ) : (
                      <button
                        className="edit"
                        onClick={() => {
                          setEditingThemeId(theme.id);
                          setNewThemeName(theme.name || "");
                        }}
                      >
                        {t("admin.update")}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      {notification && <div className={`notification ${notificationClass}`}>{notification}</div>}
    </div>
  );
};

export default ThemeTable;
