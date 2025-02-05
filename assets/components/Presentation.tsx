import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next'; // hook
import AOS from 'aos';

const TextPresentation: React.FC = () => {
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      offset: 120,
      mirror: false,
    });
    if (i18n.isInitialized) {
      setIsReady(true); // Attendre que i18next soit initialisé
    }
  }, [i18n.isInitialized]);

  if (!isReady) return <div>Loading...</div>;

  return (
    <>
      <h1 data-aos="zoom-in">{t('main_title')}</h1>
      <div className="separator"></div>
      <div className="presentation-container">
        
        <div className="texte" data-aos="fade-left">
          <h2>{t('hello_welcome')}</h2>
          <p className="mt-2 center"><Trans>{t('presentation_text_1')}</Trans></p>
          <p className="center"><Trans>{t('presentation_text_2')}</Trans></p>
          <p className="center"><Trans>{t('presentation_text_3')}</Trans></p>
          <p className="center"><Trans>{t('presentation_text_4')}</Trans></p>
          <p className="center"><Trans>{t('presentation_text_5')}</Trans></p>
          <p className="center"><Trans>{t('presentation_text_6')}</Trans></p>

        </div>
      </div>
      <div className="separator"></div>
    </>
  );
};

export default TextPresentation;
