import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Interface pour les projets
interface Project {
  title: string;
  imageUrl: string;
  link: string;
}

// Définition de ton tableau de projets
const projects: Project[] = [
  { title: "Lixim", imageUrl: "images/lixim.png", link: "https://lixim.fr" },
  { title: "La compagnie des CGP", imageUrl: "images/laciedescgp.png", link: "https://www.laciedescgp.fr/" },
  { title: "Directgestion", imageUrl: "images/directgestion.png", link: "https://directgestion.com" },
  { title: "Port folio Guillaume Quesnel", imageUrl: "images/guillaume-quesnel.png", link: "https://guillaume-quesnel.com" },
];

const ProjectCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // Gère l'index du projet visible
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Détection mobile
  const [slideDirection, setSlideDirection] = useState(""); // Direction du glissement (pour animation)
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    AOS.init({
      duration: 1000, // Durée de l'animation en millisecondes
      easing: 'ease-in-out', // Transition fluide
      once: true, // Animation ne se produit qu'une fois
      offset: 120, // Décalage avant déclenchement
      mirror: false, // Évite les répétitions inutiles
    });
    if (i18n.isInitialized) {
      setIsReady(true); // Marquer comme prêt une fois i18next initialisé
    }
  }, [i18n.isInitialized]);

  // Gestion du redimensionnement pour s'adapter aux tailles d'écran
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Nettoyage du listener
  }, []);

  // Fonction pour passer au projet suivant (avec animation de glissement)
  const nextProject = () => {
    setSlideDirection("next");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length); // Rotation circulaire
      setSlideDirection(""); // Réinitialisation de la direction après animation
    }, 300); // Durée de l'animation
  };

  // Fonction pour revenir au projet précédent (avec animation de glissement)
  const prevProject = () => {
    setSlideDirection("prev");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? projects.length - 1 : prevIndex - 1)); // Rotation circulaire
      setSlideDirection(""); // Réinitialisation de la direction après animation
    }, 300); // Durée de l'animation
  };

  // Déterminer quels projets afficher en fonction de la taille de l'écran
  const visibleProjects = isMobile
    ? projects // Sur mobile, afficher tous les projets
    : [
        projects[(currentIndex + 0) % projects.length],
        projects[(currentIndex + 1) % projects.length],
        projects[(currentIndex + 2) % projects.length],
      ];

  return (
    <>
      <h2 data-aos="zoom-in">{t('projects_title')}</h2>
      <div className="project-carousel">
        <div className={`carousel-container ${slideDirection}`}>
          {/* Affichage des projets */}
          {visibleProjects.map((project, index) => (
            <div key={index} className="project-slide">
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <img src={project.imageUrl} alt={project.title} className="project-image" />
                <p>{project.title}</p>
              </a>
            </div>
          ))}
        </div>

        {/* Boutons de navigation (non visibles en mode mobile) */}
        {!isMobile && (
          <>
            <button onClick={prevProject} className="prev-btn">{"<"}</button>
            <button onClick={nextProject} className="next-btn">{">"}</button>
          </>
        )}
      </div>
      <div className="separator"></div>
    </>
  );
};

export default ProjectCarousel;
