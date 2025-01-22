import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CommentForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour le formulaire et les erreurs
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Mettre à jour le `title` de la page
  useEffect(() => {
    document.title = t('form.comment_title');
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: any = {};

    // Validation du champ contenu
    if (!content) {
      newErrors.content = t('form.content_required');
    }

    // Si des erreurs existent, on les affiche et on arrête la soumission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simuler un envoi de formulaire
    try {
      const formData = { content };
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      setFlashMessages([t('form.success_message')]);
      setContent('');
      setErrors({});
    } catch (error) {
      setFlashMessages([t('form.error_message')]);
    }
  };

  return (
    <>
      <h2>{t('form.leave_comment')}</h2>

      {/* Messages Flash */}
      <div className="form-group">
        {flashMessages.map((msg, index) => (
          <div key={index} className="flash-success">{msg}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Contenu du commentaire */}
        <div className="form-group">
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('form.leave_comment_placeholder')}
          />
          {errors.content && <div className="error">{errors.content}</div>}
        </div>

        {/* Bouton d'envoi */}
        <div className="form-group">
          <button type="submit" className="green-button">{t('form.send')}</button>
        </div>
      </form>

      {/* Formulaire Twig simulé dans React */}
      <h2>{t('form.comment_form')}</h2>
      <div className="form-group">
        {/* Commentaire dynamique */}
        <textarea
          className="form-control"
          placeholder={t('form.leave_comment')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="form-group">
        <button type="submit" className="green-button">{t('form.submit_comment')}</button>
      </div>
    </>
  );
};

export default CommentForm;
