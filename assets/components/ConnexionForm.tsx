import React, { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

const ConnexionForm: React.FC = () => {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);
  const [flashType, setFlashType] = useState<'success' | 'error' | null>(null);

  // Mettre à jour dynamiquement le `title` de la page
  useEffect(() => {
    document.title = t('form.connexion_title');
  }, [t]);

  // Fonction de soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    const newErrors: string[] = [];
  
    if (!username) {
      newErrors.push(t('form.username_required'));
    }
    if (!password) {
      newErrors.push(t('form.password_required'));
    }
  
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setErrors([]);
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
        credentials: 'include',
      });
  
      const data = await response.json();
  
      if (response.ok && data.message === 'Connexion réussie') {
        setFlashMessages([t('form.login_success')]);
        setFlashType('success');
      } else {
        setFlashMessages([t('form.login_failed')]);
        setFlashType('error');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setFlashMessages([t('form.connexion_error')]);
      setFlashType('error');
    }
  };

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
          <div className={flashType === 'error' ? 'flash-error' : 'flash-success'}>
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
          <button type="submit" className="green-button">
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
