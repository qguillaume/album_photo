import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CommentForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs et erreurs du formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // État pour afficher les erreurs de validation
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Mettre à jour le `title` de la page
  useEffect(() => {
    document.title = t('form.contact_title'); // Définit dynamiquement
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: any = {};

    // Validation des champs
    if (!name) newErrors.name = t('form.name_required');
    if (!email) {
      newErrors.email = t('form.email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('form.email_invalid');
    }
    if (!message) newErrors.message = t('form.message_required');

    // Si des erreurs existent, on les affiche et on arrête la soumission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simuler un envoi de formulaire
    try {
      const formData = { name, email, message };
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      setFlashMessages([t('form.success_message')]);
      setName('');
      setEmail('');
      setMessage('');
      setErrors({});
    } catch (error) {
      setFlashMessages([t('form.error_message')]);
    }
  };

  return (
    <>
      <h2>{t('contact_form')}</h2>

      {/* Messages Flash */}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('form.name_placeholder')}
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>
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
          <textarea
            className="form-control"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('form.message_placeholder')}
          />
          {errors.message && <div className="error">{errors.message}</div>}
        </div>
        <div className="form-group">
          <button type="submit" className="green-button">{t('form.send')}</button>
        </div>
      </form>
    </>
  );
};

export default CommentForm;
