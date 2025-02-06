import React from 'react';
import Presentation from './Presentation';
import Languette from './Languette';
import Competences from './Competences';
import Timeline from './Timeline';
import ProjectCarousel from './ProjectCarousel';
import CVContact from './CVContact';

const Homepage: React.FC = () => {
  return (
    <div>
        <Presentation />
        <ProjectCarousel />
        <Competences />
        <Languette />
        <Timeline />
        <CVContact />
    </div>
  );
};

export default Homepage;
