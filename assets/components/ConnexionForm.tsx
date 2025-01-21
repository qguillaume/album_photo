import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ConnexionForm: React.FC = () => {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  useEffect(() => {
    console.log('Mise à jour du titre de la page :', t('form.connexion_title'));
    document.title = t('form.connexion_title');
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Soumission du formulaire...');

    const newErrors: any = {};

    if (!username) {
      newErrors.username = t('form.username_required');
    }
    if (!password) {
      newErrors.password = t('form.password_required');
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('Validation échouée avec les erreurs :', newErrors);
      setErrors(newErrors);
      return;
    }

    try {
      const formData = { username, password };
      console.log('Données envoyées au backend :', formData);

      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const responseText = await response.text();
      console.log('Réponse du serveur:', responseText);

      if (response.ok) {
        const data = await response.json();
        console.log('Données reçues du serveur:', data);
        setFlashMessages([t('form.success_message')]);
        setUsername('');
        setPassword('');
        setErrors({});
      } else {
        const errorData = await response.json();
        console.log('Erreur du backend :', errorData);
        setFlashMessages([t('form.error_message')]);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire :', error);
      setFlashMessages([t('form.error_message')]);
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
          <label htmlFor="username">{t('form.username_placeholder')}</label>
          <input
            id="username"
            className="form-control"
            type="text"
            value={username}
            onChange={(e) => {
              console.log('Nom d\'utilisateur modifié :', e.target.value);
              setUsername(e.target.value);
            }}
            placeholder={t('form.username_placeholder')}
          />
          {errors.username && <div className="error">{errors.username}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password">{t('form.password_placeholder')}</label>
          <input
            id="password"
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => {
              console.log('Mot de passe modifié :', e.target.value);
              setPassword(e.target.value);
            }}
            placeholder={t('form.password_placeholder')}
          />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>
        <div className="form-group">
          <button type="submit" className="green-button">
            {t('form.send')}
          </button>
        </div>

        <div className="form-group mt-2">
          <a href="/forgot_password">{t('forgot_password')}</a>
        </div>
      </form>
    </>
  );
};

export default ConnexionForm;
