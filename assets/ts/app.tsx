import React from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
    return <h1>Bienvenue dans Symfony avec React et TypeScript !</h1>;
};

// Attends que le DOM soit complètement chargé avant de créer un root React
document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        // Crée un root une seule fois
        const root = ReactDOM.createRoot(rootElement as HTMLElement);
        // Ensuite, utilise render() pour afficher l'application
        root.render(<App />);
    } else {
        console.error("Élément 'root' non trouvé dans le DOM.");
    }
});
