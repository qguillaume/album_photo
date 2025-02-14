import React, { useEffect, useState } from "react";
import "../styles/components/_timeline.scss"; // Ajoute les styles nécessaires
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTranslation } from 'react-i18next'; // hook

interface TimelineItem {
  year: string;
  description: string;
  duration: string;
  details: string; // Détails supplémentaires pour la modale
}

const Timeline: React.FC = () => {
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);


  const timelineData: TimelineItem[] = [
    { year: "2025", description: t('portfolio_gq'), duration: "", details: t('portfolio_gq_details') },
    { year: "2024", description: t('bellon'), duration: t('6_mois'), details: t('bellon_details') },
    { year: "2019", description: t('alphalives'), duration: t('4_ans'), details: t('alphalives_details') },
    { year: "2018", description: t('fnac'), duration: t('1_an'), details: t('fnac_details') },
    { year: "2016", description: t('neuros'), duration: t('1_an_et_demi'), details: t('neuros_details') },
    { year: "2015", description: t('sygedel'), duration: t('1_an'), details: t('sygedel_details') },
    { year: "2014", description: t('bnp_paribas'), duration: t('1_an'), details: t('bnp_paribas_details') },
    { year: "2012", description: t('directgestion'), duration: t('2_ans'), details: t('directgestion_details') },
    { year: "2011", description: t('ajc_formation'), duration: t('6_mois'), details: t('ajc_formation_details') },
    { year: "2009", description: t('paris_7'), duration: "", details: t('paris_7_details') },
  ];

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      offset: 120,
      mirror: false,
    });
  }, []);

  const openModal = (item: TimelineItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <>
      <h2 data-aos="zoom-in">{t('journey')}</h2>
      <section className="timeline">
        <div className="timeline-container">
          {timelineData.map((item, index) => (
            <div 
              key={index} 
              className="timeline-item" 
              data-aos="zoom-in"
              onClick={() => openModal(item)}
            >
              <div className="timeline-content">
                <h3>{item.year}</h3>
                <p>{item.description}</p>
                <h4>{item.duration}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="center">{selectedItem.year} - {selectedItem.description}</h3>
            <p>{selectedItem.details}</p>
            <button onClick={closeModal} className="close-btn">Fermer</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Timeline;
