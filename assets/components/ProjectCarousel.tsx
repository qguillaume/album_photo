import { useState, useEffect } from "react";

// Interface pour les projets
interface Project {
  title: string;
  imageUrl: string;
  link: string;
}

const projects: Project[] = [
  { title: "Lixim", imageUrl: "images/lixim.png", link: "https://lixim.fr" },
  { title: "La compagnie des CGP", imageUrl: "images/laciedescgp.png", link: "https://www.laciedescgp.fr/" },
  { title: "Directgestion", imageUrl: "images/directgestion.png", link: "https://directgestion.com" },
  { title: "Port folio Guillaume Quesnel", imageUrl: "images/guillaume-quesnel.png", link: "https://guillaume-quesnel.com" },
];

const ProjectCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [slideDirection, setSlideDirection] = useState(""); // Pour animer le glissement

  // Écoute du redimensionnement pour adapter l'affichage
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fonction pour aller au projet suivant (rotation circulaire)
  const nextProject = () => {
    setSlideDirection("next");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
      setSlideDirection("");
    }, 300); // Correspond à la durée de l'animation CSS
  };

  // Fonction pour aller au projet précédent (rotation circulaire)
  const prevProject = () => {
    setSlideDirection("prev");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? projects.length - 1 : prevIndex - 1));
      setSlideDirection("");
    }, 300);
  };

  // Gestion des éléments affichés
  const visibleProjects = isMobile
    ? projects // En mode mobile, on affiche TOUS les éléments
    : [
        projects[(currentIndex + 0) % projects.length],
        projects[(currentIndex + 1) % projects.length],
        projects[(currentIndex + 2) % projects.length],
      ];

  return (
    <div className="project-carousel">
      <div className={`carousel-container ${slideDirection}`}>
        {visibleProjects.map((project, index) => (
          <div key={index} className="project-slide">
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <img src={project.imageUrl} alt={project.title} className="project-image" />
              <p>{project.title}</p>
            </a>
          </div>
        ))}
      </div>

      {/* Boutons pour navigation (cachés sur mobile) */}
      {!isMobile && (
        <>
          <button onClick={prevProject} className="prev-btn">{"<"}</button>
          <button onClick={nextProject} className="next-btn">{">"}</button>
        </>
      )}
    </div>
  );
};

export default ProjectCarousel;
