import React, { useEffect, useState } from "react";
import "../styles/components/_timeline.scss"; // Ajoute les styles nécessaires
import AOS from 'aos';
import 'aos/dist/aos.css';

interface TimelineItem {
  year: string;
  description: string;
  duration: string;
}

const timelineData: TimelineItem[] = [
  { year: "2024", description: "Développeur Fullstack Groupe Bellon", duration: "6 mois"},
  { year: "2019", description: "Développeur PHP, Laravel - Alphalives Multimedia", duration: "4 ans" },
  { year: "2018", description: "Développeur PHP, Symfony - Groupe Fnac-Darty", duration: "1 an" },
  { year: "2016", description: "Développeur PHP, SugarCRM - Neuros Assurance", duration: "1 an et demi" },
  { year: "2015", description: "Développeur PHP, Symfony - Sygedel Assurance", duration: "1 an" },
  { year: "2014", description: "Ingénieur d'études Java - BNP Paribas", duration: "1 an" },
  { year: "2012", description: "Développeur PHP - Directgestion", duration: "2 ans" },
  { year: "2011", description: "Formation XHTML/CSS, PHP, MySQL, JAVA, UML", duration: "6 mois" },
  { year: "2009", description: "Maîtrise Informatique - Université Paris 7", duration: "" },
];

const Timeline: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    
    AOS.init({
      duration: 1000, // Durée de l'animation en millisecondes
      easing: 'ease-in-out', // Transition fluide
      once: true, // Animation ne se produit qu'une fois
      offset: 120, // Décalage avant déclenchement
      mirror: false, // Évite les répétitions inutiles
    });
    const handleScroll = () => {
      const items = document.querySelectorAll(".timeline-item");
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
            setVisibleItems((prev) => {
                const updated = [...prev]; // Copie l'ancien tableau
                if (!updated.includes(index)) {
                  updated.push(index); // Ajoute uniquement si l'élément n'est pas encore inclus
                }
                return updated;
              });
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Vérifie au chargement initial
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="timeline">
      <h2 className="timeline-title" data-aos="zoom-in">Mon Parcours</h2>
      <div className="timeline-container">
        {timelineData.map((item, index) => (
          <div key={index} className="timeline-item" data-aos="zoom-in">
            <div className="timeline-content">
              <h3>{item.year}</h3>
              <p>{item.description}</p>
              <h4>{item.duration}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Timeline;
