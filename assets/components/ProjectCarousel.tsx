import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';  // Styles pour la navigation
import 'swiper/css/pagination';  // Styles pour la pagination

import { useState, useEffect } from 'react';

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
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Fonction pour vérifier le chargement des images
    const checkImagesLoaded = () => {
      let loadedImagesCount = 0;
      let totalImagesCount = projects.length;

      // Vérifie si chaque image se charge
      projects.forEach((project) => {
        const img = new Image();
        img.src = project.imageUrl;
        img.onload = () => {
          loadedImagesCount += 1;
          if (loadedImagesCount === totalImagesCount) {
            setImagesLoaded(true); // Toutes les images sont chargées
          }
        };
        img.onerror = () => {
          console.error("Erreur de chargement de l'image pour", project.title);
        };
      });
    };

    checkImagesLoaded(); // Appelle la fonction de vérification dès que le composant est monté
  }, []);

  if (!imagesLoaded) {
    return <div>Chargement des images...</div>; // Affiche un message de chargement si les images ne sont pas encore prêtes
  }

  return (
    <div className="project-carousel">
      <Swiper
        spaceBetween={30}
        slidesPerView={3}
        loop={true}
        pagination={{ clickable: true }}
        navigation={false}
        onSlideChange={() => console.log('Slide changé')}
        onSwiper={(swiper) => console.log(swiper)}
      >
        {projects.map((project, index) => (
          <SwiperSlide key={index}>
            <div className="project-slide">
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="project-image"
                  style={{
                    width: '100%',
                    maxWidth: '200px',
                    height: 'auto',
                    objectFit: 'cover',
                  }}
                />
                <p>{project.title}</p>
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProjectCarousel;
