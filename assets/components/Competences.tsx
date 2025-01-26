// Competences.tsx - Affiche toutes les compétences
import React from 'react';
import Competence from './Competence';

// Tableau de compétences avec leur icône et nom
const competencesLeft = [
  { icon: '/icons/html.svg', name: 'HTML' },
  { icon: '/icons/css.svg', name: 'CSS' },
  { icon: '/icons/js.svg', name: 'JavaScript' },
  { icon: '/icons/react.svg', name: 'React' },
  { icon: '/icons/nodejs.svg', name: 'Node.js' },
  { icon: '/icons/typescript.svg', name: 'TypeScript' },
  { icon: '/icons/mysql.svg', name: 'MySQL' },
  { icon: '/icons/jenkins.svg', name: 'Jenkins' },
  { icon: '/icons/jquery.svg', name: 'jQuery' },
];

const competencesRight = [
  { icon: '/icons/php.svg', name: 'PHP' },
  { icon: '/icons/symfony.svg', name: 'Symfony' },
  { icon: '/icons/laravel.svg', name: 'Laravel' },
  { icon: '/icons/git.svg', name: 'Git' },
  { icon: '/icons/github.svg', name: 'GitHub' },
  { icon: '/icons/docker.svg', name: 'Docker' },
  { icon: '/icons/postman.svg', name: 'Postman' },
  { icon: '/icons/jira.svg', name: 'Jira' },
  { icon: '/icons/gimp.svg', name: 'GIMP' },
];

const Competences: React.FC = () => {
  return (
    <div className="presentation-container">
      {/* Compétences à gauche */}
      <div className="competences" data-aos="fade-right">
        {competencesLeft.map((competence, index) => (
          <Competence
            key={index}
            icon={competence.icon}
            name={competence.name}
          />
        ))}
      </div>

      {/* Compétences à droite */}
      <div className="competences" data-aos="fade-left">
        {competencesRight.map((competence, index) => (
          <Competence
            key={index}
            icon={competence.icon}
            name={competence.name}
          />
        ))}
      </div>
    </div>
  );
};

export default Competences;
