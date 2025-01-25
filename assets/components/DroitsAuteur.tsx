import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DroitsAuteur: React.FC = () => {
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions

  useEffect(() => {
    document.title = t('droits_auteur.title');
  }, [t]); // Le hook se relance lorsque `t` (la fonction de traduction) change

  return (
    <div>
      <div
        style={{
          maxWidth: '800px',
          margin: '20px auto',
          padding: '20px',
        }}
      >
        <h1 style={{ textAlign: 'center' }}>{t('droits_auteur.title')}</h1>

        <h2>{t('droits_auteur.respect_title')}</h2>
        <p>{t('droits_auteur.respect_text')}</p>

        <h2>{t('droits_auteur.protection_title')}</h2>
        <p>{t('droits_auteur.protection_text')}</p>
      </div>
    </div>
  );
};

export default DroitsAuteur;
