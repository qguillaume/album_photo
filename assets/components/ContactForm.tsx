import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ContactForm: React.FC = () => {
  const { t } = useTranslation();
  
  // État pour les champs du formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // État pour afficher les erreurs de validation
  const [errors, setErrors] = useState<any>({});

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: any = {};

    // Validation des champs
    if (!name) {
      newErrors.name = t('form.name_required');
    }
    if (!email) {
      newErrors.email = t('form.email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('form.email_invalid');
    }
    if (!message) {
      newErrors.message = t('form.message_required');
    }

    // Si des erreurs existent, on les affiche et on arrête la soumission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Préparation des données du formulaire
    const formData = { name, email, message };

    try {
      // Envoyer les données avec fetch (POST)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du formulaire');
      }

      // Réponse du serveur
      const result = await response.json();
      console.log('Réponse du serveur:', result);

      // Optionnel : Reset le formulaire et afficher un message de succès
      setName('');
      setEmail('');
      setMessage('');
      alert(t('form.success_message')); // Afficher un message de succès

    } catch (error) {
      console.error('Erreur de soumission:', error);
      alert(t('form.error_message')); // Afficher un message d'erreur si l'envoi échoue
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>{t('form.name')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('form.name_placeholder')}
        />
        {errors.name && <div className="error">{errors.name}</div>}
      </div>
      <div>
        <label>{t('form.email')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('form.email_placeholder')}
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>
      <div>
        <label>{t('form.message')}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('form.message_placeholder')}
        />
        {errors.message && <div className="error">{errors.message}</div>}
      </div>
      <button type="submit">{t('form.send')}</button>
    </form>
  );
};

export default ContactForm;
