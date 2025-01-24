import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ForgetPasswordForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs et erreurs du formulaire
  const [email, setEmail] = useState('');
  
  // État pour afficher les erreurs de validation
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Mettre à jour le `title` de la page
  useEffect(() => {
    document.title = t('form.forget_password_title'); // Définit dynamiquement
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: string[] = [];

    // Validation des champs
    if (!email) {
      newErrors.push(t('form.email_required'));
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push(t('form.email_invalid'));
    }

    // Si des erreurs existent, on les affiche et on arrête la soumission
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Réinitialiser les erreurs si tout est valide
    setErrors([]);

    // Préparer les données et envoyer la requête
    try {
      const formData = { email };
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      // Ajouter le message de succès
      setFlashMessages([t('form.forget_password_success_message')]);
      setEmail(''); // Réinitialiser le champ après un envoi réussi
    } catch (error) {
      // Ajouter le message d'erreur
      setFlashMessages([t('form.forget_password_error_message')]);
    }
  };

  return (
    <>
      <h2>{t('form.forget_password_h2')}</h2>

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

      <p className="center">{t('form.forget_password_instruction')}</p>

      <form onSubmit={handleSubmit}>
        {/* Champ email */}
        <div className="form-group">
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('form.email_placeholder')}
          />
        </div>

        {/* Bouton d'envoi */}
        <div className="form-group">
          <button type="submit" className="green-button">
            {t('form.send')}
          </button>
        </div>

        {/* Lien vers la page de connexion */}
        <div className="form-group mt-2">
          <a href="/login">{t('form.back_to_login')}</a>
        </div>
      </form>
    </>
  );
};

export default ForgetPasswordForm;
