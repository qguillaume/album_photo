import React, { useEffect } from "react";
import Prism from "prismjs";

// Assure-toi que Prism est bien importé avec le bon thème
import "prismjs/themes/prism.css";
import "prismjs/components/prism-css";

// Composant principal
const MemoCSS: React.FC = () => {
  useEffect(() => {
    Prism.highlightAll(); // Mettre en évidence le code quand le composant se charge
  }, []);

  return (
    <div className="memo-css">
      <h1>Référentiel CSS - Mémo Visuel</h1>

      <div className="css-example">
        <h2>text-align</h2>
        <pre>
          <code className="language-css">{`div {
  text-align: center;
}`}</code>
        </pre>
        <div className="example-box" style={{ textAlign: "center" }}>
          Exemple de texte centré
        </div>
      </div>
    </div>
  );
};

export default MemoCSS;
