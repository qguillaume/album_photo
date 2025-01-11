import React, { useState, useEffect } from "react";

const ThemeToggle: React.FC = () => {
  // Initialiser avec le mode sombre par défaut si aucune valeur dans le localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true; // Par défaut, "dark mode"
  });

  // Change le thème et met à jour le localStorage
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  // Appliquer les classes sur le body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");  
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px", // Espacement entre les éléments
        zIndex: 1000, // Toujours au-dessus des autres éléments
      }}
    >
      {/* Label pour la lune à gauche */}
      <label
        htmlFor="lightModeToggle"
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src="/icons/moon.svg"
          alt="Lune"
          style={{
            width: "24px",
            height: "24px",
            transition: "color 0.5s ease", // Transition fluide
          }}
        />
      </label>

      {/* Switch */}
      <label className="switch light-mode-toggle" style={{ position: "relative" }}>
        <input
          type="checkbox"
          id="lightModeToggle"
          checked={!isDarkMode} // "checked" correspond au mode clair
          onChange={toggleTheme}
          style={{ display: "none" }} // On masque l'input visuellement
        />
        <span className="slider"></span>
      </label>

      {/* Label pour le soleil à droite */}
      <label
        htmlFor="lightModeToggle"
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src="/icons/sun-orange.svg"
          alt="Soleil"
          style={{
            width: "24px",
            height: "24px",
            opacity: isDarkMode ? 0.5 : 1, // Opacité pour indiquer le mode
            transition: "opacity 0.5s ease", // Transition fluide
          }}
        />
      </label>
    </div>
  );
};

export default ThemeToggle;
