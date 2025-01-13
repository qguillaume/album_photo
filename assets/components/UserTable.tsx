import React, { useState } from "react";
import Pagination from "./PaginationDashboard";
import { User } from "../ts/types";

interface UserTableProps {
  users: User[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [userList, setUserList] = useState(users);
  const [notification, setNotification] = useState<string | null>(null); // Ajout de l'état pour la notification
  const [notificationClass, setNotificationClass] = useState<string>(""); // Ajout pour gérer les classes CSS

  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  const sortedUsers = [...userList].sort((a, b) => {
    let aValue: any = a[sortConfig.key];
    let bValue: any = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSort = (key: keyof User) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  const totalPages = Math.ceil(userList.length / usersPerPage);

  // Fonction pour gérer l'ajout ou le retrait du rôle "ROLE_ADMIN"
  const handleRoleChange = async (userId: number, isAdmin: boolean) => {
    // Mise à jour du state local
    setUserList((prevList) =>
      prevList.map((user) => {
        if (user.id === userId) {
          const newRoles = [...user.roles];
          if (isAdmin) {
            if (!newRoles.includes("ROLE_ADMIN")) {
              newRoles.push("ROLE_ADMIN");
            }
          } else {
            const index = newRoles.indexOf("ROLE_ADMIN");
            if (index !== -1) {
              newRoles.splice(index, 1);
            }
          }
          return { ...user, roles: newRoles };
        }
        return user;
      })
    );

    try {
      // Appel API pour mettre à jour le rôle sur le serveur
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roles: isAdmin ? ["ROLE_USER", "ROLE_ADMIN"] : ["ROLE_USER"], // On envoie les rôles mis à jour
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour des rôles.");
      }

      // Afficher la notification de succès
      setNotification("Le rôle a été mis à jour avec succès.");
      setNotificationClass("show"); // Afficher la notification

      // Cacher la notification après 5 secondes avec animation
      setTimeout(() => setNotificationClass("hide"), 5000);

    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle :", error);
    }
  };

  // Fonction pour gérer le bannissement d'un utilisateur
  const handleBanChange = async (userId: number, isBanned: boolean) => {
    // Mise à jour du state local
    setUserList((prevList) =>
      prevList.map((user) => {
        if (user.id === userId) {
          return { ...user, isBanned: isBanned }; // Mettre à jour l'état "banni"
        }
        return user;
      })
    );
  
    try {
      // En fonction de l'état du bannissement, on choisit la bonne route
      const url = isBanned ? `/api/users/${userId}/ban` : `/api/users/${userId}/unban`;
      
      // Appel API pour mettre à jour l'état de bannissement sur le serveur
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Échec de la mise à jour du bannissement.");
      }
  
      // Afficher la notification de succès
      setNotification(isBanned ? "Utilisateur banni avec succès." : "Utilisateur débanni avec succès.");
      setNotificationClass("show"); // Afficher la notification
  
      // Cacher la notification après 5 secondes avec animation
      setTimeout(() => setNotificationClass("hide"), 5000);
  
    } catch (error) {
      console.error("Erreur lors de la mise à jour du bannissement :", error);
    }
  };
  

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
              Email {sortConfig.key === "email" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Rôle Admin</th>
            <th>Est Banni</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => {
            const rowClass = (index + 1) % 2 === 0 ? "even-row-users" : "odd-row-users";

            return (
              <tr key={user.id} className={rowClass}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.roles.includes("ROLE_ADMIN")}
                      onChange={(e) => handleRoleChange(user.id, e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.isBanned} // Afficher l'état de bannissement
                      onChange={(e) => handleBanChange(user.id, e.target.checked)} // Gérer le bannissement
                    />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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

export default UserTable;
