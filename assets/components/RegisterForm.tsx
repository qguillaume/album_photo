import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RegisterForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs et erreurs du formulaire
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // État pour afficher les erreurs de validation
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Mettre à jour dynamiquement le `title` de la page
  useEffect(() => {
    document.title = t('form.register_title');
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: string[] = [];

    // Validation des champs
    if (!username) newErrors.push(t('form.username_required'));
    if (username.length < 4) {
      newErrors.push(t('form.username_min_length', { limit: 4 }));
    }
    if (username.length > 30) {
      newErrors.push(t('form.username_max_length', { limit: 30 }));
    }
    if (!email) {
      newErrors.push(t('form.email_required'));
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push(t('form.email_invalid'));
    }
    if (!password) newErrors.push(t('form.password_required'));
    if (password.length < 8) {
      newErrors.push(t('form.password_min_length', { limit: 8 }));
    }
    if (password.length > 60) {
      newErrors.push(t('form.password_max_length', { limit: 60 }));
    }
    // Si des erreurs existent, on les affiche et on arrête la soumission
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Réinitialiser les erreurs
    setErrors([]);

    // Simuler un envoi de formulaire
    try {
      const formData = { username, email, password };
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      setFlashMessages([t('form.register_success_message')]);
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setFlashMessages([t('form.register_error_message')]);
    }
  };

  return (
    <>
      <h2>{t('register_form')}</h2>

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

      {/* Flash success pour les messages globaux */}
      {flashMessages.length > 0 && (
        <div className="center">
          <div className="flash-success">
            {flashMessages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire d'inscription */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            value={username}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('form.username_placeholder')}
          />
        </div>
        <div className="form-group">
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('form.email_placeholder')}
          />
        </div>
        <div className="form-group">
          <input
            className="form-control"
            type={showPassword ? "text" : "password"}
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
          <button type="submit" className="green-button">{t('form.send')}</button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
