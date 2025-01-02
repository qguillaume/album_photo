// src/components/PhotoTable.tsx
import React from 'react';
import { Photo } from '../ts/types';

interface PhotoTableProps {
  photos: Photo[];
}

const PhotoTable: React.FC<PhotoTableProps> = ({ photos }) => {
  return (
    <div className="table-container">
      <h2>Top Photos par Likes</h2>
      <table className="photo-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Titre de la Photo</th>
            <th>Nombre de Likes</th>
          </tr>
        </thead>
        <tbody>
          {photos.map((photo, index) => (
            <tr key={photo.id}>
              <td>{index + 1}</td>
              <td>{photo.title}</td>
              <td>{photo.likesCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PhotoTable;
