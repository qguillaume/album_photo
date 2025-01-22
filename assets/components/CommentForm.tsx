import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CommentForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour le formulaire, les erreurs, les messages flash, les commentaires et le chargement
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);  // Etat pour le chargement

  // Récupérer les commentaires existants de l'API Symfony
  useEffect(() => {
    setLoading(true);  // On commence par définir `loading` à true avant de récupérer les commentaires
    fetch('/comments_list')
      .then((response) => response.json())
      .then((data) => {
        setComments(data);
        setLoading(false);  // Une fois les commentaires récupérés, on met `loading` à false
      })
      .catch((error) => {
        console.error('Error fetching comments:', error);
        setLoading(false);  // En cas d'erreur, on met aussi `loading` à false
      });
  }, []);

  // Mettre à jour le titre de la page
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
      const response = await fetch('/photo/124/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      const data = await response.json();
      setFlashMessages([t('form.success_message')]);
      setComments([...comments, data.comment]);
      setContent('');
      setErrors({});
    } catch (error) {
      setFlashMessages([t('form.error_message')]);
    }
  };

  return (
    <div>
      <h2>{t('form.leave_comment')}</h2>

      {/* Messages Flash */}
      <div className="form-group">
        {flashMessages.map((msg, index) => (
          <div key={index} className="flash-success">{msg}</div>
        ))}
      </div>

      {/* Affichage des commentaires existants */}
      <div className="comments-list">
        {loading ? (
          <p>{t('form.loading_comments')}</p>
        ) : comments.length > 0 ? (
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <strong>{comment.user.username}</strong>: {comment.content}
                <br />
                <small>Posté le {comment.createdAt}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>{t('no_comment')}</p>
        )}
      </div>

      {/* Formulaire de commentaire */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('form.leave_comment_placeholder')}
          />
          {errors.content && <div className="error">{errors.content}</div>}
        </div>

        <div className="form-group">
          <button type="submit" className="green-button">{t('form.send')}</button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
