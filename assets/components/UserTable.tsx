import React, { useEffect, useState } from "react";
import Pagination from "./PaginationDashboard";

interface User {
  id: number;
  username: string;
  email: string;
}

interface UserTableProps {
  users: User[];  // Les utilisateurs sont passés en props
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const usersPerPage = 10; // Nombre d'users par page
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: "asc" | "desc" }>({
      key: "id",
      direction: "asc",
    });
  
    // Fonction pour trier les utilisateurs
    const sortedUsers = [...users].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];
  
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    // Calculer les utilisateurs à afficher pour la page courante
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Changer de page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  

    // Gérer le tri par colonne
    const handleSort = (key: keyof User) => {
      setSortConfig((prevConfig) => ({
        key,
        direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
      }));
    };
  
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="table-container">
      <h2>Liste des Utilisateurs</h2>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} />
      <table className="dashboard-table">
        <thead>
          <tr>
          <th onClick={() => handleSort("id")}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("username")}>
              Nom d'utilisateur {sortConfig.key === "username" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("email")}>
              Publié {sortConfig.key === "email" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => {
            // Applique une classe différente pour les lignes impaires et paires
            const rowClass = (index + 1) % 2 === 0 ? "even-row-users" : "odd-row-users"; 

            return (
              <tr key={user.id} className={rowClass}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
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
export default UserTable;
