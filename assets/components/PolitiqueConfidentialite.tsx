import React from 'react';
import { useTranslation } from 'react-i18next';

const PolitiqueConfidentialite: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center' }}>{t('politique_confidentialite.title')}</h1>

        <h2>{t('politique_confidentialite.introduction')}</h2>
        <p>{t('politique_confidentialite.intro_text')}</p>

        <h2>{t('politique_confidentialite.data_collection.title')}</h2>
        <p>{t('politique_confidentialite.data_collection.text')}</p>

        <h3>{t('politique_confidentialite.data_collection.types.title')}</h3>
        <p>{t('politique_confidentialite.data_collection.types.text')}</p>

        <h2>{t('politique_confidentialite.use_of_data.title')}</h2>
        <p>{t('politique_confidentialite.use_of_data.text')}</p>

        <h2>{t('politique_confidentialite.security.title')}</h2>
        <p>{t('politique_confidentialite.security.text')}</p>

        <h2>{t('politique_confidentialite.cookies.title')}</h2>
        <p>{t('politique_confidentialite.cookies.text')}</p>

        <h3>{t('politique_confidentialite.cookies.management.title')}</h3>
        <p>{t('politique_confidentialite.cookies.management.text')}</p>

        <h2>{t('politique_confidentialite.rights.title')}</h2>
        <p>{t('politique_confidentialite.rights.text')}</p>

        <h2>{t('politique_confidentialite.contact.title')}</h2>
        <p>{t('politique_confidentialite.contact.text')}</p>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
