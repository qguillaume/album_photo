import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ContactForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs du formulaire et les erreurs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Mettre à jour le titre de la page dynamiquement
  useEffect(() => {
    document.title = t('form.contact_title');
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: string[] = [];

    // Validation des champs
    if (!name) newErrors.push(t('form.name_required'));
    if (name.length < 4) {
      newErrors.push(t('form.username_min_length', { limit: 4 }));
    }
    if (name.length > 30) {
      newErrors.push(t('form.username_max_length', { limit: 30 }));
    }

    if (!email) {
      newErrors.push(t('form.email_required'));
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push(t('form.email_invalid'));
    }
    if (email.length < 10) {
      newErrors.push(t('form.email_min_length', { limit: 10 }));
    }
    if (email.length > 60) {
      newErrors.push(t('form.email_max_length', { limit: 60 }));
    }

    if (!message) newErrors.push(t('form.message_required'));
    if (message.length < 10) {
      newErrors.push(t('form.message_min_length', { limit: 10 }));
    }
    if (message.length > 5000) {
      newErrors.push(t('form.message_max_length', { limit: 5000 }));
    }
    
    // Si des erreurs existent, les afficher sous forme de flash et arrêter la soumission
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Réinitialiser les erreurs
    setErrors([]);

    try {
      const formData = { name, email, message };
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      setFlashMessages([t('form.contact_success_message')]);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setFlashMessages([t('form.contact_error_message')]);
    }
  };

  return (
    <>
      <h2>{t('contact_form')}</h2>

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

      <form onSubmit={handleSubmit}>
        {/* Champ Nom */}
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            name="contact_form[name]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('form.name_placeholder')}
          />
        </div>

        {/* Champ Email */}
        <div className="form-group">
          <input
            className="form-control"
            type="email"
            name="contact_form[email]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('form.email_placeholder')}
          />
        </div>

        {/* Champ Message */}
        <div className="form-group">
          <textarea
            className="form-control"
            name="contact_form[message]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('form.message_placeholder')}
          />
        </div>

        {/* Bouton de soumission */}
        <div className="form-group">
          <button type="submit" className="green-button">
            {t('form.send')}
          </button>
        </div>
      </form>
    </>
  );
};

export default ContactForm;
