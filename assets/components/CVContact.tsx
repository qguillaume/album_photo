// CVContact.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Hook pour accéder aux traductions
import AOS from 'aos';
import 'aos/dist/aos.css';
import CVDownloadButton from './CVDownloadButton';
import ContactButton from './ContactButton';

const CVContact: React.FC = () => {
  const { t, i18n } = useTranslation();
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
      setIsReady(true);
    }
  }, [i18n.isInitialized]);

  if (!isReady) return null;

  const handleDownloadCV = () => {
    const cvUrl = "/files/CV.pdf";
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = "CV.pdf"; 
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
          <CVDownloadButton onClick={handleDownloadCV} />
        </div>
      </div>
    </>
  );
};

export default CVContact;
