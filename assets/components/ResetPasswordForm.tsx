import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

type FlashMessage = {
  type: string;
  message: string;
};

const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();

  // États pour les champs et erreurs du formulaire
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Mise à jour de flashMessages pour gérer le type et le message
  const [flashMessages, setFlashMessages] = useState<FlashMessage[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Mettre à jour le `title` de la page
  useEffect(() => {
    document.title = t('form.reset_password_title'); // Définit dynamiquement
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!token) {
      setFlashMessages([{ type: 'error', message: 'Token manquant ou invalide' }]);
      return;
    }
    
    // Validation des champs
    if (!password) {
      newErrors.password = t('form.password_required');
    } else if (password.length < 6) {
      newErrors.password = t('form.password_min_length', { limit: 6 });
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('form.password_mismatch');
    }

    // Si des erreurs existent, on les affiche et on arrête la soumission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Envoi de la requête POST à l'API avec le token et le mot de passe
      const response = await fetch(`/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la soumission');
      }

      const data = await response.json();
      setFlashMessages([{ type: 'success', message: data.message }]);
      setPassword('');
      setConfirmPassword('');
      setErrors({});

      // Rediriger vers la page de connexion
      // setTimeout(() => {
      //   navigate('/login');
      // }, 2000);
    } catch (error: any) {
      setFlashMessages([{ type: 'error', message: error.message }]);
    }
  };

  return (
    <>
      <h2>{t('form.reset_password_title')}</h2>

      {Object.keys(errors).length > 0 && (
        <div className="center">
          <div className="flash-error">
            <ul>
              {Object.keys(errors).map((key) => (
                <li key={key}>{errors[key]}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Flash messages (success/error) */}
      {flashMessages.length > 0 && (
        <div className="center">
          {flashMessages.map((msg, index) => (
            <div key={index} className={`flash-${msg.type}`}>
              {msg.message}
            </div>
          ))}
        </div>
      )}
      <p className="center">{t('form.reset_password_instruction')}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('form.new_password_placeholder')}
          />
        </div>

        <div className="form-group">
          <input
            className="form-control"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('form.confirm_password_placeholder')}
          />
        </div>

        <div className="form-group">
          <button type="submit" className="green-button">{t('form.reset_password')}</button>
        </div>

        {/* Lien vers la page de connexion */}
        <div className="form-group mt-2">
          <a href="/login">{t('form.back_to_login')}</a>
        </div>
      </form>
    </>
  );
};

export default ResetPasswordForm;
