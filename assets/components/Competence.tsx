// Affiche une seule compétence
import React from 'react';

interface CompetenceProps {
  icon: string;
  name: string;
}

const Competence: React.FC<CompetenceProps> = ({ icon, name }) => {
  return (
    <div className="competence">
      <img src={icon} alt={name} />
      <div className="competence-text">{name}</div>
    </div>
  );
};

export default Competence;