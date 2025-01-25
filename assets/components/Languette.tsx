import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/components/_languette.scss';
import '../styles/components/_lightmode.scss';
import ThemeToggle from './ThemeToggle';

const Languette: React.FC = () => {
  // État pour savoir si la languette est ouverte ou fermée
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation(); // Utilisation de i18n pour changer la langue

  // Fonction pour alterner l'état
  const toggleLanguette = () => {
    setIsOpen(!isOpen); // Inverse l'état pour ouvrir ou fermer la languette
  };

  // Fonction pour changer la langue
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="languette-container">
      <div className={`languette ${isOpen ? 'open' : ''}`}>
        
        <div id="lightModeToggle">
          <ThemeToggle />
        </div>

        <div className="custom-select">
            <div className="selected-option">
              {['fr', 'en', 'es', 'de'].map((lang) => (
                <div key={lang}>
                  {i18n.language === lang && (
                    <img
                      src={`/images/${lang}.png`} 
                      alt={`${lang} flag`}
                      className="flag-icon"
                    />
                  )}
                </div>
              ))}
            </div>
            <ul className="options">
              {['fr', 'en', 'es', 'de'].map((lang) => (
                <li key={lang}>
                  <button onClick={() => changeLanguage(lang)}>
                    <img src={`/images/${lang}.png`} alt={`${lang} flag`} className="flag-icon" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        
      </div>

      <button className={`languette-toggle ${isOpen ? 'open' : ''}`} onClick={toggleLanguette}>
        {isOpen ? '>' : '<'}
      </button>
    </div>
  );
};

export default Languette;
