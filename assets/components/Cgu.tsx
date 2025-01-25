import React from 'react';
import { useTranslation } from 'react-i18next';

const Cgu: React.FC = () => {
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
        <h1 style={{ textAlign: 'center' }}>{t('conditions.title')}</h1>

        <h2>{t('conditions.introduction')}</h2>
        <p>{t('conditions.intro_text')}</p>

        <h2>{t('conditions.acceptance.title')}</h2>
        <p>{t('conditions.acceptance.text')}</p>

        <h2>{t('conditions.access.title')}</h2>
        <p>{t('conditions.access.text')}</p>

        <h2>{t('conditions.intellectual_property.title')}</h2>
        <p>{t('conditions.intellectual_property.text')}</p>

        <h2>{t('conditions.responsibility.title')}</h2>
        <p>{t('conditions.responsibility.text')}</p>

        <h2>{t('conditions.personal_data.title')}</h2>
        <p>{t('conditions.personal_data.text')}</p>

        <h2>{t('conditions.cookies.title')}</h2>
        <p>{t('conditions.cookies.text')}</p>

        <h2>{t('conditions.modification.title')}</h2>
        <p>{t('conditions.modification.text')}</p>

        <h2>{t('conditions.law.title')}</h2>
        <p>{t('conditions.law.text')}</p>

        <h2>{t('conditions.contact.title')}</h2>
        <p>{t('conditions.contact.text')}</p>
      </div>
    </div>
  );
};

export default Cgu;
