import React, { useEffect, useState } from "react";
import "../styles/components/_timeline.scss"; // Ajoute les styles nécessaires

interface TimelineItem {
  year: string;
  description: string;
}

const timelineData: TimelineItem[] = [
  { year: "2025", description: "Développeur Web Freelance" },
  { year: "2023", description: "Formation Symfony" },
  { year: "2022", description: "Licence Informatique" },
  { year: "2020", description: "DUT Informatique" },
  { year: "2018", description: "Baccalauréat Scientifique" },
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
