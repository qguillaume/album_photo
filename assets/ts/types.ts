export interface Photo {
    id: number;
    title: string;
    filePath: string;
    albumId: number;
    album: string;
    likesCount: number;
    commentsCount: number;
  }

export interface Album {
    id: number;
    nom: string;
    photos: Photo[];
  }

  declare global {
    interface Window {
      albumsData: any[]; // ou type plus spécifique si vous connaissez la structure exacte des albums
      photosData: any[];  // même pour photosData
    }
  }
  
  // Permet de transformer ce fichier en module
  export {};