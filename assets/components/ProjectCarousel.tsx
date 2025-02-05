import { useState } from 'react';

// Interface pour les projets
interface Project {
  title: string;
  imageUrl: string;
  link: string;
}

const projects: Project[] = [
  {
    title: 'Lixim',
    imageUrl: 'images/lixim.png',
    link: 'https://lixim.fr',
  },
  {
    title: 'La compagnie des CGP',
    imageUrl: 'images/laciedescgp.png',
    link: 'https://www.laciedescgp.fr/',
  },
  {
    title: 'Directgestion',
    imageUrl: 'images/directgestion.png',
    link: 'https://directgestion.com',
  },
];

const ProjectCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  /*
  // Fonction pour aller au projet suivant
  const nextProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  // Fonction pour aller au projet précédent
  const prevProject = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? projects.length - 1 : prevIndex - 1
    );
  };*/

  return (
    <div className="project-carousel">
      <div className="carousel-container">
        {projects.map((project, index) => (
          <div
            key={index}
            className={`project-slide ${index === currentIndex ? 'active' : ''}`}
          >
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="project-image"
              />
              <p>{project.title}</p>
            </a>
          </div>
        ))}
      </div>

      {/* Boutons pour navigation 
      <button onClick={prevProject} className="prev-btn">
        Précédent
      </button>
      <button onClick={nextProject} className="next-btn">
        Suivant
      </button>
      */}
    </div>
  );
};

export default ProjectCarousel;
