import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from "../ts/types";

// Définition du contexte avec un utilisateur initial à null
interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Créer le contexte avec une valeur par défaut
const UserContext = createContext<UserContextType | undefined>(undefined);

// Créer un provider pour le contexte
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // L'état de l'utilisateur, initialisé à null

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte utilisateur
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être dans un UserProvider');
  }
  return context;
};
