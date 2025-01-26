import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CommentForm: React.FC = () => {
  const { t } = useTranslation();
  
  // Récupérer l'ID de la photo depuis l'attribut data-photo-id de l'élément div
  const photoId = (document.getElementById('comment-form-root') as HTMLElement)?.getAttribute('data-photo-id');
  
  // Vérifier si l'ID est valide
  if (!photoId) {
    return <div>{t('form.photo_not_found')}</div>;  // Message d'erreur si l'ID est manquant
  }

  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);  // Etat pour le chargement

  // Récupérer les commentaires existants de l'API Symfony
  useEffect(() => {
    setLoading(true);  // On commence par définir `loading` à true avant de récupérer les commentaires
    fetch(`/photo/${photoId}/comments`)  // Utiliser photoId ici pour récupérer les commentaires
      .then((response) => response.json())
      .then((data) => {
        setComments(data);
        setLoading(false);  // Une fois les commentaires récupérés, on met `loading` à false
      })
      .catch((error) => {
        console.error('Error fetching comments:', error);
        setLoading(false);  // En cas d'erreur, on met aussi `loading` à false
      });
  }, [photoId]);

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

    try {
      const formData = { content };
      const response = await fetch(`/photo/${photoId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      const data = await response.json();
      setFlashMessages([t('form.comment_success_message')]);
      setComments((prevComments) => [
        ...prevComments,
        {
          id: data.comment.id,
          content: data.comment.content,
          user: { username: 'Current User' },
          createdAt: data.comment.createdAt,
        },
      ]);
      setContent('');
      setErrors({});
    } catch (error) {
      setFlashMessages([t('form.comment_error_message')]);
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

      {/* Affichage des commentaires */}
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
          <p className="center">{t('no_comment')}</p>
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
