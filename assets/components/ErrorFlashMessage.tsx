import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorFlashMessageProps {
  errorMessage?: string;
}

const ErrorFlashMessage: React.FC<ErrorFlashMessageProps> = ({ errorMessage }) => {
  const { t } = useTranslation();

  if (!errorMessage) {
    return null; // Ne rien afficher si 'errorMessage' est indéfini ou vide
  }
  
  return (
    <div className="flash-error">
      <span>{t(errorMessage)}</span>
    </div>
  );
};

export default ErrorFlashMessage;