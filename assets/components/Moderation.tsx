import React from 'react';
import { useTranslation } from 'react-i18next';

const Moderation: React.FC = () => {
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions

  return (
    <div>
      <div
        style={{
          maxWidth: '800px',
          margin: '20px auto',
          padding: '20px',
        }}
      >
        <h1 style={{ textAlign: 'center' }}>{t('moderation.title')}</h1>

        <h2>{t('moderation.comment_moderation.title')}</h2>
        <p>{t('moderation.comment_moderation.text')}</p>

        <h2>{t('moderation.photo_moderation.title')}</h2>
        <p>{t('moderation.photo_moderation.text')}</p>
      </div>
    </div>
  );
};

export default Moderation;
