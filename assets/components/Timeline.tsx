import React, { useEffect, useState } from "react";
import "../styles/components/_timeline.scss"; // Ajoute les styles nécessaires
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTranslation, Trans } from 'react-i18next'; // hook

interface TimelineItem {
  year: string;
  description: string;
  duration: string;
}

const Timeline: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions
  const [isReady, setIsReady] = useState(false);

const timelineData: TimelineItem[] = [
  { year: "2025", description: t('portfolio_gq'), duration: "" },
  { year: "2024", description: t('bellon'), duration: t('6_mois') },
  { year: "2019", description: t('alphalives'), duration: t('4_ans') },
  { year: "2018", description: t('fnac'), duration: t('1_an') },
  { year: "2016", description: t('neuros'), duration: t('1_an_et_demi') },
  { year: "2015", description: t('sygedel'), duration: t('1_an') },
  { year: "2014", description: t('bnp_paribas'), duration: t('1_an') },
  { year: "2012", description: t('directgestion'), duration: t('2_ans') },
  { year: "2011", description: t('ajc_formation'), duration: t('6_mois') },
  { year: "2009", description: t('paris_7'), duration: "" },
];

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
    <>
      <h2 data-aos="zoom-in">{t('journey')}</h2>
      <section className="timeline">
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
      <div className="separator"></div>
    </>
  );
};

export default Timeline;
