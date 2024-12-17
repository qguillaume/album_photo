// Import de Prism.js
import "prismjs";
import "prismjs/themes/prism.css"; // Thème par défaut (tu peux changer ici)
import "prismjs/components/prism-css"; // Support pour le CSS

// Permettre le support de Prism avec React
import { useEffect } from "react";
import Prism from "prismjs";

// Import de ton composant React
import React from "react";
import ReactDOM from "react-dom";
import MemoCSS from "../components/MemoCSS"; // Chemin vers ton composant React

// Exemple d'initialisation d'un composant React dans une div "root"
ReactDOM.render(<MemoCSS />, document.getElementById("root"));
