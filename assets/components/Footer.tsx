import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next'; // hook
import AOS from 'aos';

const Footer: React.FC = () => {
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
        <footer>
            <p>© { t('copyright')} - Guillaume Quesnel</p>
            <div className="social-icons">
                <a href="https://www.linkedin.com/in/guillaume-quesnel-a567352aa/" target="_blank">
                    <img src="/images/logo_linkedin.png" alt="LinkedIn" className="social-icon" />
                </a>
            </div>
        </footer>
    </>
  );
};

export default Footer;
