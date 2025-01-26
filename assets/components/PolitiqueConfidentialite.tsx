import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PolitiqueConfidentialite: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('politique_confidentialite.title');
  }, [t]); // Le hook se relance lorsque `t` (la fonction de traduction) change

  return (
    <div>
      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center' }}>{t('politique_confidentialite.title')}</h1>

        <h2>{t('politique_confidentialite.introduction')}</h2>
        <p>{t('politique_confidentialite.intro_text')}</p>

        <h2>{t('politique_confidentialite.data_collection.title')}</h2>
        <p>{t('politique_confidentialite.data_collection.text')}</p>

        <h2>{t('politique_confidentialite.use_of_data.title')}</h2>
        <p>{t('politique_confidentialite.use_of_data.text')}</p>

        <h2>{t('politique_confidentialite.security.title')}</h2>
        <p>{t('politique_confidentialite.security.text')}</p>

        <h2>{t('politique_confidentialite.cookies.title')}</h2>
        <p>{t('politique_confidentialite.cookies.text')}</p>

        <h2>{t('politique_confidentialite.third_party_services.title')}</h2>
        <p>{t('politique_confidentialite.third_party_services.text')}</p>

        <h2>{t('politique_confidentialite.user_rights.title')}</h2>
        <p>{t('politique_confidentialite.user_rights.text')}</p>

        <h2>{t('politique_confidentialite.data_retention.title')}</h2>
        <p>{t('politique_confidentialite.data_retention.text')}</p>

        <h2>{t('politique_confidentialite.policy_updates.title')}</h2>
        <p>{t('politique_confidentialite.policy_updates.text')}</p>

        <h2>{t('politique_confidentialite.contact.title')}</h2>
        <p>{t('politique_confidentialite.contact.text')}</p>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
