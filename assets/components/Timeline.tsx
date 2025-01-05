import React, { useEffect, useState } from "react";
import "../styles/components/_timeline.scss"; // Ajoute les styles nécessaires

interface TimelineItem {
  year: string;
  description: string;
}

const timelineData: TimelineItem[] = [
  { year: "2024", description: "Développeur Fullstack Groupe Bellon" },
  { year: "2019", description: "Développeur PHP, Laravel - Alphalives Multimedia" },
  { year: "2018", description: "Développeur PHP, Symfony - Groupe Fnac-Darty" },
  { year: "2016", description: "Développeur PHP, SugarCRM - Neuros Assurance" },
  { year: "2015", description: "Développeur PHP, Symfony - Sygedel Assurance" },
  { year: "2014", description: "Ingénieur d'études Java - BNP Paribas" },
  { year: "2012", description: "Développeur PHP - Directgestion" },
  { year: "2011", description: "Formation XHTML/CSS, PHP, MySQL, JAVA, UML" },
  { year: "2009", description: "Maîtrise Informatique - Université Paris 7" },
];

const Timeline: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
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
      <h2 className="timeline-title">Mon Parcours</h2>
      <div className="timeline-container">
        {timelineData.map((item, index) => (
          <div
            key={index}
            className={`timeline-item ${visibleItems.includes(index) ? "visible" : ""}`}
          >
            <div className="timeline-content">
              <h3>{item.year}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Timeline;
