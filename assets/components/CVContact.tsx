// CVContact.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Hook pour accéder aux traductions
import AOS from 'aos';
import 'aos/dist/aos.css';
import CVDownloadButton from './CVDownloadButton';
import ContactButton from './ContactButton';

// Composant principal pour téléchargement du CV et contact
const CVContact: React.FC = () => {
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

  if (!isReady) return null; // Afficher rien ou un loader pendant l'initialisation

  const handleDownloadCV = () => {
    const link = document.createElement("a");
    link.href = "/files/CV_FR.pdf";
    link.download = "CV_FR.pdf"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCVInternational = () => {
    const link = document.createElement("a");
    link.href = "/files/CV_EN.pdf";
    link.download = "CV_EN.pdf"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <h2 data-aos="zoom-in">{t('profile_interest')}</h2>
      <p className="cv-p" data-aos="fade-up">{t('collab_sentence')}</p>
      <div className="cv-contact">
        <div className="cvc-buttons" data-aos="fade-up">
          <ContactButton />
          <button className="green-button" onClick={handleDownloadCV}>
            {t('download_cv')}
          </button>
          <button className="green-button" onClick={handleDownloadCVInternational}>
            {t('download_cv_international')}
          </button>
        </div>
      </div>
    </>
  );
};

export default CVContact;
