import React, { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Récupérer les utilisateurs depuis l'API Symfony
  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Erreur lors de la récupération des utilisateurs", error));
  }, []);

  return (
    <div className="table-container">
      <div>
        <h2>Liste des Utilisateurs</h2>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom d'utilisateur</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
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
      </div>
    </div>
  );
};

export default UserTable;
