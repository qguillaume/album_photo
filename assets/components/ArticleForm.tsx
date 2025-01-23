import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ArticleForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs et erreurs du formulaire
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [themes, setThemes] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Récupérer l'utilisateur connecté et les thèmes au chargement du composant
  useEffect(() => {
    document.title = t('form.article_title'); // Met à jour le titre de la page

    // Récupérer l'utilisateur connecté
    const fetchUser = async () => {
      const userResponse = await fetch('/api/user');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setAuthor(userData.username);  // Remplir avec le nom d'utilisateur
      }
    };

    // Récupérer les thèmes depuis l'API
    const fetchThemes = async () => {
      const themesResponse = await fetch('/themes_list');
      if (themesResponse.ok) {
        const themesData = await themesResponse.json();
        setThemes(themesData);  // Mettre à jour l'état des thèmes
      }
    };

    fetchUser();
    fetchThemes();
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: any = {};

    // Validation des champs
    if (!author) newErrors.author = t('form.author_required');
    if (!title) newErrors.title = t('form.title_required');
    if (!theme) newErrors.theme = t('form.theme_required');
    if (!content) newErrors.content = t('form.content_required');

    // Si des erreurs existent, on les affiche et on arrête la soumission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simuler un envoi de formulaire
    try {
      const formData = { author, title, theme, content, published };
      const response = await fetch('/api/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      setFlashMessages([t('form.success_message')]);
      setAuthor('');
      setTitle('');
      setTheme('');
      setContent('');
      setPublished(false);
      setErrors({});
    } catch (error) {
      setFlashMessages([t('form.error_message')]);
    }
  };

  return (
    <>
      <h2>{t('form.article_form_title')}</h2>

      {/* Messages Flash */}
      <div className="form-group">
        {flashMessages.map((msg, index) => (
          <div key={index} className="flash-success">{msg}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Auteur */}
        <div className="form-group">
          <select
            className="form-control"
            value={author}
            disabled // Empêcher la modification du nom de l'auteur
          >
            <option value="">{t('form.author_placeholder')}</option>
            <option value={author}>{author}</option>
          </select>
          {errors.author && <div className="error">{errors.author}</div>}
        </div>

        {/* Titre */}
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('form.title_placeholder')}
          />
          {errors.title && <div className="error">{errors.title}</div>}
        </div>

        {/* Thème */}
        <div className="form-group">
          <select
            className="form-control"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="">{t('form.theme_placeholder')}</option> {/* Placeholder pour les thèmes */}
            {themes.map((themeOption) => (
              <option key={themeOption.id} value={themeOption.id}>
                {themeOption.name}
              </option>
            ))}
          </select>
          {errors.theme && <div className="error">{errors.theme}</div>}
        </div>

        {/* Contenu */}
        <div className="form-group">
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('form.content_placeholder')}
          />
          {errors.content && <div className="error">{errors.content}</div>}
        </div>

        {/* Switch "Publié" */}
        <div className="form-group-wrapper">
          <div className="form-group">
            <label htmlFor="published">{t('form.published_label')}</label>
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
        </div>

        {/* Bouton de soumission */}
        <div className="form-group-wrapper">
          <div className="form-group mt-5">
            <button type="submit" className="green-button">{t('form.save')}</button>
          </div>
        </div>
      </form>
    </>
  );
};

export default ArticleForm;
