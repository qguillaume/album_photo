import React from 'react';

interface PhotoViewerProps {
  photoUrl: string;
  photoTitle: string;
  closeViewer: () => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ photoUrl, photoTitle, closeViewer }) => {

  // Cette fonction fermera l'image lorsque vous cliquez n'importe où sur l'overlay
  const handleOverlayClick = () => {
    closeViewer();  // Ferme le viewer quand on clique n'importe où sur l'overlay
  };

  return (
    <div className="photo-overlay" onClick={handleOverlayClick}>
      <img
        src={photoUrl}
        alt={photoTitle}
        className="photo-fullscreen"
      />
      <h2>{photoTitle}</h2>
    </div>
  );
};

export default PhotoViewer;
