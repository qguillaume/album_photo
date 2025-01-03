export interface Photo {
    id: number;
    title: string;
    filePath: string;
    albumId: number;
    album: string;
    likesCount: number;
  }

export interface Album {
    id: number;
    nom: string;
    photos: Photo[];
  }