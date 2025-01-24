import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ForgetPasswordForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs et erreurs du formulaire
  const [email, setEmail] = useState('');
  
  // État pour afficher les erreurs de validation
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Mettre à jour le `title` de la page
  useEffect(() => {
    document.title = t('form.forget_password_title'); // Définit dynamiquement
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: any = {};

    // Validation des champs
    if (!email) {
      newErrors.email = t('form.email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('form.email_invalid');
    }

    // Si des erreurs existent, on les affiche et on arrête la soumission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simuler un envoi de formulaire
    try {
      const formData = { email };
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      setFlashMessages([t('form.forget_password_success_message')]);
      setEmail('');
      setErrors({});
    } catch (error) {
      setFlashMessages([t('form.forget_password_error_message')]);
    }
  };

  return (
    <>
      <h2>{t('form.forget_password_h2')}</h2>

      {/* Messages Flash */}
      <div className="form-group">
        {flashMessages.map((msg, index) => (
          <div key={index} className="flash-success">{msg}</div>
        ))}
      </div>

      <p className="center">{t('form.forget_password_instruction')}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('form.email_placeholder')}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <button type="submit" className="green-button">{t('form.send')}</button>
        </div>
        <div className="form-group mt-2">
          <a href="/login">{t('form.back_to_login')}</a>
        </div>
      </form>

      
    </>
  );
};

export default ForgetPasswordForm;
