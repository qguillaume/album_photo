import React, { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Importer le hook

const ConnexionForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUser(); // Utiliser le hook pour obtenir l'utilisateur

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rediriger l'utilisateur si déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/'); // Rediriger si l'utilisateur est déjà connecté
    }
  }, [user, navigate]);

  // Fonction de soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Marque la soumission comme en cours

    const newErrors: string[] = [];

    // Vérification des champs
    if (!username) {
      newErrors.push(t('form.username_required'));
    }
    if (!password) {
      newErrors.push(t('form.password_required'));
    }

    // Si des erreurs existent, les afficher sous forme de flash error
    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false); // Arrêter la soumission si des erreurs
      return;
    }

    // Réinitialiser les erreurs
    setErrors([]);

    try {
      const formData = new URLSearchParams();
      formData.append('login_form[username]', username);
      formData.append('login_form[password]', password);

      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        setFlashMessages([t('form.login_success')]);
        navigate('/'); // Redirection vers la page d'accueil après la connexion réussie
      } else {
        setFlashMessages([t('form.login_failed')]);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setFlashMessages([t('form.connection_error')]);
    }

    setIsSubmitting(false); // Arrêter la soumission
  };

  // Nettoyage des messages flash après 3 secondes
  useEffect(() => {
    if (flashMessages.length > 0) {
      const timer = setTimeout(() => {
        setFlashMessages([]);
      }, 3000);
      return () => clearTimeout(timer); // Cleanup du timer
    }
  }, [flashMessages]);

  // Debug : Affichage de l'état de l'utilisateur
  console.log("User is logged in:", user);

  // Rendu du formulaire s'il n'y a pas d'utilisateur ou si on n'est pas encore en train de soumettre
  return (
    <>
      <h2>{t('connexion_form')}</h2>

      {/* Flash errors pour les erreurs de validation */}
      {errors.length > 0 && (
        <div className="center">
          <div className="flash-error">
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Flash success/error pour les messages globaux */}
      {flashMessages.length > 0 && (
        <div className="center">
          <div className="flash-success">
            {flashMessages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire de connexion */}
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
        </div>

        <div className="form-group">
          <button type="submit" className="green-button" disabled={isSubmitting}>
            {t('form.send')}
          </button>
        </div>

        <div className="form-group mt-2">
          <a href="/forgot-password">{t('forgot_password')}</a>
        </div>
      </form>
    </>
  );
};

export default ConnexionForm;
