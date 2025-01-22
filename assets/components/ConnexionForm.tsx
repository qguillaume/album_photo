import React, { useState, FormEvent } from 'react';

const ConnexionForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Fonction de soumission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    const newErrors: any = {};
    if (!username) {
      newErrors.username = 'Nom d\'utilisateur requis';
    }
    if (!password) {
      newErrors.password = 'Mot de passe requis';
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    try {
      // On utilise URLSearchParams pour envoyer les données sous forme de paramètres de formulaire
      const formData = new URLSearchParams();
      formData.append('login_form[username]', username);
      formData.append('login_form[password]', password);
  
      // Envoi des données au backend
      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData, // Pas besoin d'ajouter headers 'Content-Type', car c'est automatiquement détecté
        credentials: 'include',  // Permet d'inclure les cookies dans la requête
      });
  
      if (response.ok) {
        setFlashMessages(['Connexion réussie']);
        // Gérer l'état de l'utilisateur connecté, rediriger ou mettre à jour le state global
      } else {
        setFlashMessages(['Nom d\'utilisateur ou mot de passe incorrect']);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setFlashMessages(['Erreur lors de la connexion']);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
  <input
    type="text"
    name="login_form[username]"
    placeholder="Nom d'utilisateur"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
  />
  {errors.username && <div className="error">{errors.username}</div>}

  <input
    type="password"
    name="login_form[password]"
    placeholder="Mot de passe"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  {errors.password && <div className="error">{errors.password}</div>}

  <button type="submit">Se connecter</button>

  {flashMessages.length > 0 && (
    <div>
      {flashMessages.map((msg, index) => (
        <div key={index} className="flash-message">{msg}</div>
      ))}
    </div>
  )}
</form>
  );
};

export default ConnexionForm;
