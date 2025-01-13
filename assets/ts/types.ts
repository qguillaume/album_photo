export interface Photo {
  id: number;
  title: string;
  filePath: string;
  albumId: number;
  album: string;
  likesCount: number;
  commentsCount: number;
  isVisible: boolean;
  isApproved: boolean;
}

export interface Album {
  id: number;
  nom: string;
  photos: Photo[];
  isVisible: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  isBanned: boolean;
}

export interface Theme {
  id: number;
  name: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author: { // Définir author comme un objet
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface Comment {
  id: number;
  content: string;
  user: { // Définir user comme un objet
    username: string;
  };
  photo: { // Définir photo comme un objet
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

declare global {
  interface Window {
    albumsData: any[];
    photosData: any[];
  }
}

// Permet de transformer ce fichier en module
export {};