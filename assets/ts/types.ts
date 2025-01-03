export interface Photo {
    id: number;
    title: string;
    filePath: string;
    albumId: number;
    likesCount: number;
  }

export interface Album {
    id: number;
    nom: string;
    photos: Photo[];
  }