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
    <div className="presentation-container">
      <div className="photo-presentation" data-aos="fade-right">
        <img src="images/photo_presentation.jpg" alt="Photo de présentation" />
      </div>
      <div className="texte" data-aos="fade-left">
        <h2>{t('hello_welcome')}</h2>
        <p><Trans>{t('presentation_text_1')}</Trans></p>
        <p><Trans>{t('presentation_text_2')}</Trans></p>
        <p><Trans>{t('presentation_text_3')}</Trans></p>
        <p><Trans>{t('presentation_text_4')}</Trans></p>
        <p><Trans>{t('presentation_text_5')}</Trans></p>
        <p><Trans>{t('presentation_text_6')}</Trans></p>
        <p><Trans>{t('presentation_text_7')}</Trans></p>
      </div>
    </div>
  );
};

export default TextPresentation;
