import React, { useState } from 'react';
import '../styles/components/_languette.scss';

const Languette: React.FC = () => {
  // État pour savoir si la languette est ouverte ou fermée
  const [isOpen, setIsOpen] = useState(false);

  // Fonction pour alterner l'état
  const toggleLanguette = () => {
    setIsOpen(!isOpen); // Inverse l'état pour ouvrir ou fermer la languette
  };

  return (
    <div className="languette-container">
      <div className={`languette ${isOpen ? 'open' : ''}`}>
        <p>Contenu de la languette</p>
      </div>

      <button className={`languette-toggle ${isOpen ? 'open' : ''}`} onClick={toggleLanguette}>
        {isOpen ? '>' : '<'}
      </button>
    </div>
  );
};

export default Languette;
