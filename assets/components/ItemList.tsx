import React, { useState } from "react";

// Définition du type pour un album ou une photo
interface Item {
  id: number;
  name: string; // Nom de l'album ou photo
  imagePath: string; // Chemin de l'image
}

interface Props {
  items: Item[]; // Liste d'albums ou de photos
  onEdit: (id: number) => void; // Callback pour modifier
  onDelete: (id: number) => void; // Callback pour supprimer
}

const ItemList: React.FC<Props> = ({ items, onEdit, onDelete }) => {
  const [selectedAction, setSelectedAction] = useState<{ [id: number]: "edit" | "delete" | null }>({});

  // Fonction pour gérer l'action (modifier ou supprimer)
  const handleAction = (id: number, action: "edit" | "delete") => {
    setSelectedAction((prev) => ({ ...prev, [id]: action }));
  };

  return (
    <div className="item-list">
      {items.map((item) => (
        <div key={item.id} className="item">
          <img src={item.imagePath} alt={item.name} className="item-image" />
          <p>{item.name}</p>
          <div className="actions">
            <button
              className="edit-button"
              onClick={() => handleAction(item.id, "edit")}
            >
              Modifier
            </button>
            <button
              className="delete-button"
              onClick={() => handleAction(item.id, "delete")}
            >
              Supprimer
            </button>
          </div>
          {selectedAction[item.id] === "edit" && (
            <span className="icon edit-icon">✏️</span>
          )}
          {selectedAction[item.id] === "delete" && (
            <span className="icon delete-icon">❌</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ItemList;
