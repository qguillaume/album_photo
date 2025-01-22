import React, { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

const ConnexionForm: React.FC = () => {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

// Mettre à jour le `title` de la page
useEffect(() => {
    document.title = t('form.connexion_title'); // Définit dynamiquement
}, [t]);

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


    <>
      <h2>{t('connexion_form')}</h2>

      <div className="form-group">
        {flashMessages.map((msg, index) => (
          <div key={index} className="flash-success">{msg}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            name="login_form[username]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('form.username_placeholder')}
          />
          {errors.username && <div className="error">{errors.username}</div>}
        </div>

        <div className="form-group">
          <input
            className="form-control"
            type="password"
            name="login_form[password]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('form.password_placeholder')}
          />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>
        <div className="form-group">
          <button type="submit" className="green-button">{t('form.send')}</button>
        </div>
      </form>
    </>
  );
};

export default ConnexionForm;
