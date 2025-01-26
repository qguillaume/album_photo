import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const MentionsLegales: React.FC = () => {
  const { t } = useTranslation();

    useEffect(() => {
      document.title = t('mentions_legales.title');
    }, [t]); // Le hook se relance lorsque `t` (la fonction de traduction) change
  

  return (
    <div>
      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center' }}>{t('mentions_legales.title')}</h1>

        <h2>{t('mentions_legales.introduction')}</h2>
        <p>{t('mentions_legales.intro_text')}</p>

        <h2>{t('mentions_legales.publisher.title')}</h2>
        <p>{t('mentions_legales.publisher.text')}</p>

        <h2>{t('mentions_legales.director.title')}</h2>
        <p>{t('mentions_legales.director.text')}</p>

        <h2>{t('mentions_legales.host.title')}</h2>
        <p>{t('mentions_legales.host.text')}</p>

        <h2>{t('mentions_legales.responsibility.title')}</h2>
        <p>{t('mentions_legales.responsibility.text')}</p>

        <h2>{t('mentions_legales.intellectual_property.title')}</h2>
        <p>{t('mentions_legales.intellectual_property.text')}</p>

        <h2>{t('mentions_legales.links.title')}</h2>
        <p>{t('mentions_legales.links.text')}</p>

        <h2>{t('mentions_legales.data_protection.title')}</h2>
        <p>{t('mentions_legales.data_protection.text')}</p>

        <h2>{t('mentions_legales.jurisdiction.title')}</h2>
        <p>{t('mentions_legales.jurisdiction.text')}</p>

        <h2>{t('mentions_legales.contact.title')}</h2>
        <p>{t('mentions_legales.contact.text')}</p>
      </div>
    </div>
  );
};

export default MentionsLegales;
