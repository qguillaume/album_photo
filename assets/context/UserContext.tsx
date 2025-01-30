import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from "../ts/types";

// Définition du contexte avec un utilisateur initial à null
interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
}

// Créer le contexte avec une valeur par défaut
const UserContext = createContext<UserContextType | undefined>(undefined);

// Créer un provider pour le contexte
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis le backend
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', { credentials: 'include' });

        // Log de la réponse pour déboguer
        //console.log('Réponse API:', response);

        if (response.ok) {
          const data = await response.json();

          // Log des données utilisateur récupérées
          //console.log('Données utilisateur récupérées :', data);

          setUser(data); // Met à jour l'utilisateur dans le contexte
        } else {
          // Si l'utilisateur n'est pas connecté, on met à null
          setUser(null);
        }
      } catch (error) {
        // Gérer les erreurs de récupération de l'utilisateur
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // Charge l'utilisateur une fois au démarrage

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte utilisateur
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  // Vérifier que le contexte est bien présent
  if (!context) {
    throw new Error('useUser doit être dans un UserProvider');
  }

  return context;
};
