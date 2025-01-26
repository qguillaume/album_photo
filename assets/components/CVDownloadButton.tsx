// CVDownloadButton.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CVDownloadButtonProps {
  onClick: () => void; // Callback pour gérer l'événement de téléchargement
}

const CVDownloadButton: React.FC<CVDownloadButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <button className="green-button" onClick={onClick}>
      {t('download_cv')}
    </button>
  );
};

export default CVDownloadButton;
