import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ThemeForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs et erreurs du formulaire
  const [themename, setThemename] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Mettre à jour dynamiquement le titre de la page
  useEffect(() => {
    document.title = t('form.theme_title');
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: string[] = [];

    // Validation des champs
    if (!themename) newErrors.push(t('form.themename_required'));

    // Si des erreurs existent, les afficher et arrêter la soumission
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Réinitialiser les erreurs si tout est valide
    setErrors([]);

    try {
      const formData = { themename };
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      setFlashMessages([t('form.theme_success_message')]);
      setThemename(''); // Réinitialiser le champ après un envoi réussi
    } catch (error) {
      setFlashMessages([t('form.theme_error_message')]);
    }
  };

  return (
    <>
      <h2>{t('theme_form')}</h2>

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
        {/* Champ Nom du thème */}
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            name="theme_form[themename]"
            value={themename}
            onChange={(e) => setThemename(e.target.value)}
            placeholder={t('form.themename_placeholder')}
          />
        </div>

        {/* Bouton de soumission */}
        <div className="form-group">
          <button type="submit" className="green-button">
            {t('form.save')}
          </button>
        </div>
      </form>
    </>
  );
};

export default ThemeForm;
