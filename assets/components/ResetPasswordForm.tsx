import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>(); // Récupérer le token depuis l'URL
  const navigate = useNavigate(); // Permet de naviguer après le succès

  // États pour les champs et erreurs du formulaire
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // État pour afficher les erreurs de validation
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Mettre à jour le `title` de la page
  useEffect(() => {
    document.title = t('form.reset_password_title'); // Définit dynamiquement
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: any = {};

    // Validation des champs
    if (!password) {
      newErrors.password = t('form.password_required');
    } else if (password.length < 6) {
      newErrors.password = t('form.password_min_length');
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
      setFlashMessages([data.message]);
      setPassword('');
      setConfirmPassword('');
      setErrors({});

      // Rediriger vers la page de connexion
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setFlashMessages([error.message]);
    }
  };

  return (
    <>
      <h2>{t('form.reset_password_title')}</h2>

      {/* Messages Flash */}
      {flashMessages.map((msg, index) => (
        <div key={index} className="flash-success">{msg}</div>
      ))}

      <p>{t('form.reset_password_instruction')}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('form.new_password_placeholder')}
          />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        <div className="form-group">
          <input
            className="form-control"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('form.confirm_password_placeholder')}
          />
          {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
        </div>

        <div className="form-group">
          <button type="submit" className="green-button">{t('form.reset_password')}</button>
        </div>
      </form>

      {/* Lien vers la page de connexion */}
      <a href="/login">{t('form.back_to_login')}</a>
    </>
  );
};

export default ResetPasswordForm;
