import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ArticleForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs du formulaire et les erreurs
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [themes, setThemes] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Récupérer les données utilisateur et les thèmes au chargement
  useEffect(() => {
    document.title = t('form.article_title');

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setAuthor(userData.username);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchThemes = async () => {
      try {
        const response = await fetch('/themes_list');
        if (response.ok) {
          const themesData = await response.json();
          setThemes(themesData);
        }
      } catch (error) {
        console.error('Error fetching themes:', error);
      }
    };

    fetchUser();
    fetchThemes();
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: string[] = [];

    // Validation des champs
    if (!author) newErrors.push(t('form.author_required'));
    if (!title) newErrors.push(t('form.title_required'));
    if (!theme) newErrors.push(t('form.theme_required'));
    if (!content) newErrors.push(t('form.content_required'));

    // Si des erreurs existent, les afficher et arrêter la soumission
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Réinitialiser les erreurs
    setErrors([]);

    // Préparer les données et envoyer la requête
    try {
      const formData = { author, title, theme, content, published };
      const response = await fetch('/api/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      setFlashMessages([t('form.article_success_message')]);
      setAuthor('');
      setTitle('');
      setTheme('');
      setContent('');
      setPublished(false);
    } catch (error) {
      setFlashMessages([t('form.article_error_message')]);
    }
  };

  return (
    <>
      <h2>{t('form.article_form_title')}</h2>

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
        {/* Auteur */}
        <div className="form-group">
          <select
            className="form-control"
            value={author}
            disabled
          >
            <option value="">{t('form.author_placeholder')}</option>
            <option value={author}>{author}</option>
          </select>
        </div>

        {/* Titre */}
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('form.article_title_placeholder')}
          />
        </div>

        {/* Thème */}
        <div className="form-group">
          <select
            className="form-control"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="">{t('form.article_theme_placeholder')}</option>
            {themes.map((themeOption) => (
              <option key={themeOption.id} value={themeOption.id}>
                {themeOption.name}
              </option>
            ))}
          </select>
        </div>

        {/* Contenu */}
        <div className="form-group">
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('form.article_content_placeholder')}
          />
        </div>

        {/* Switch "Publié" 
        <div className="form-group-wrapper">
          <div className="form-group">
            <label htmlFor="published">{t('form.article_published_label')}</label>
            <div className="switch">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={() => setPublished(!published)}
                className="switch-input"
              />
              <span className="slider"></span>
            </div>
          </div>
        </div>*/}

        {/* Bouton de soumission */}
        <div className="form-group">
          <button type="submit" className="green-button">
            {t('form.validate')}
          </button>
        </div>
      </form>
    </>
  );
};

export default ArticleForm;
