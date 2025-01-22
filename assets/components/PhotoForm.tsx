import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PhotoForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs et erreurs du formulaire
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<any>(null);
  const [album, setAlbum] = useState('');
  const [albums, setAlbums] = useState<string[]>([]); // Pour stocker les albums dynamiques
  
  // État pour afficher les erreurs de validation
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Charger dynamiquement les albums depuis l'API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('/api/albums');
        if (response.ok) {
          const data = await response.json();
          setAlbums(data); // Supposons que la réponse contient un tableau d'albums
        } else {
          throw new Error('Failed to fetch albums');
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();
  }, []); // Récupérer les albums au montage du composant

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: any = {};

    if (!title) newErrors.title = t('form.title_required');
    if (!file) newErrors.file = t('form.file_required');
    if (!album) newErrors.album = t('form.album_required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      formData.append('album', album);

      const response = await fetch('/api/photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Submission failed');

      setFlashMessages([t('form.success_message')]);
      setTitle('');
      setFile(null);
      setAlbum('');
      setErrors({});
    } catch (error) {
      setFlashMessages([t('form.error_message')]);
    }
  };

  return (
    <>
      <h2>{t('form.publish_photo')}</h2>

      {/* Messages Flash */}
      <div className="form-group">
        {flashMessages.map((msg, index) => (
          <div key={index} className="flash-success">{msg}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
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

        {/* Fichier photo */}
        <div className="form-group">
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          {errors.file && <div className="error">{errors.file}</div>}
        </div>

        {/* Album dynamique */}
        <div className="form-group">
          <select
            className="form-control"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
          >
            <option value="">{t('form.select_album')}</option>
            {albums.length > 0 ? (
              albums.map((albumOption, index) => (
                <option key={index} value={albumOption}>{albumOption}</option>
              ))
            ) : (
              <option value="">{t('form.no_albums')}</option>
            )}
          </select>
          {errors.album && <div className="error">{errors.album}</div>}
        </div>

        {/* Bouton de soumission */}
        <div className="form-group">
          <button type="submit" className="green-button">{t('form.upload_photo')}</button>
        </div>
      </form>
    </>
  );
};

export default PhotoForm;
