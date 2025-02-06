import React, { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Importer le hook

const ConnexionForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useUser(); // Utiliser le hook pour obtenir l'utilisateur et le loading

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Ne pas rediriger tant que l'état de loading est true
  useEffect(() => {
    if (!loading && user) {
      navigate('/'); // Rediriger si l'utilisateur est déjà connecté
    }
  }, [user, loading, navigate]);

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

      const data = await response.json(); // Supposons que la réponse soit en JSON
      console.log(data);
      if (response.ok && data.success) {
        setFlashMessages([t('form.login_success')]);

        // Délai avant redirection pour permettre à l'utilisateur de voir le message flash
        setTimeout(() => {
          navigate('/'); // Redirection vers la page d'accueil après la connexion réussie
        }, 3000);
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

  // Rendu du formulaire s'il n'y a pas d'utilisateur ou si on n'est pas encore en train de soumettre
  if (loading) {
    return <div>Loading...</div>; // Si on est en train de charger l'utilisateur
  }

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
            type={showPassword ? "text" : "password"}
            name="login_form[password]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('form.password_placeholder')}
          />
        </div>

        <div className="form-group">
          <label className="switch-container">
            <label className="switch">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <span className="slider"></span>
            </label>
            <span className="switch-label">{t('form.show_password')}</span>
          </label>
        </div>

        <div className="form-group">
          <button type="submit" className="green-button" disabled={isSubmitting}>
            {t('form.send')}
          </button>
        </div>

        <div className="flash-info">
          <p>
            Attention ! Formulaire de connexion fonctionnel mais pas de redirection et message erroné en cas de connexion réussie !
            Vérifier votre connexion en cliquant sur "Accueil". En cours de résolution...
          </p>
          <br />
          <p>
            Formulaire de récupération de mot de passe non fonctionnel, en cours de résolution...
          </p>
          <br />
          <p>En cas de problème, contactez-moi via le formulaire de contact.</p>
        </div>

        <div className="form-group mt-2">
          <a href="/forgot-password">{t('forgot_password')}</a>
        </div>
      </form>
    </>
  );
};

export default ConnexionForm;