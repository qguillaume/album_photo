import React, { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
}

interface UserTableProps {
  users: User[];  // Les utilisateurs sont passés en props
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  return (
    <div className="table-container">
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
  );
};
export default UserTable;
