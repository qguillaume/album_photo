import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

  if (!isReady) return <div>{t('admin.loading')}</div>;

  return (
    <footer>
      <div className="footer-left">
        <p className="footer-text">© {t('copyright')} - Guillaume Quesnel</p>
        <div className="social-icons">
          <a
            href="https://www.https://www.linkedin.com/in/guillaume-quesnel-a567352aa/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <img
              src="/images/logo_linkedin.png"
              alt="LinkedIn"
              className="social-icon-img"
            />
          </a>
        </div>
      </div>

      <div className="footer-right">
        <ul>
          <li>
            <a href="/cgu">{t('footer.cgu')}</a>
          </li>
          <li>
            <a href="/mentions-legales">{t('footer.legal_mentions')}</a>
          </li>
          <li>
            <a href="/securite">{t('footer.security')}</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
