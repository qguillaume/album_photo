import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PhotoForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs du formulaire et les erreurs
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [album, setAlbum] = useState('');
  const [albums, setAlbums] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Charger dynamiquement les albums depuis l'API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('/api/albums');
        if (response.ok) {
          const data = await response.json();
          if (data && data.albums) {
            setAlbums(data.albums);
          } else {
            throw new Error('Invalid album data structure');
          }
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

    // Réinitialiser les erreurs
    const newErrors: string[] = [];

    // Validation des champs du formulaire
    if (!title) newErrors.push(t('form.photo_title_required'));
    if (!file) newErrors.push(t('form.photo_file_required'));
    if (!album) newErrors.push(t('form.photo_album_required'));

    // Si des erreurs existent, les afficher sous forme de flash et arrêter la soumission
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Réinitialiser les erreurs
    setErrors([]);

    // Préparer les données du formulaire (multipart/form-data pour l'image)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file as Blob);
    formData.append('album', album);

    try {
      const response = await fetch('/api/photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Photo upload failed');

      setFlashMessages([t('form.photo_success_message')]);
      setTitle('');
      setFile(null);
      setAlbum('');
    } catch (error) {
      setFlashMessages([t('form.photo_error_message')]);
    }
  };

  // Fonction pour gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  return (
    <>
      <h2>{t('form.publish_photo')}</h2>

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
        {/* Titre */}
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            name="photo_form[title]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('form.photo_title_placeholder')}
          />
        </div>

        {/* Fichier photo */}
        <div className="form-group">
          <input
            className="form-control"
            type="file"
            name="photo_form[file]"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* Album dynamique */}
        <div className="form-group">
          <select
            className="form-control"
            name="photo_form[album]"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
          >
            <option value="">{t('form.select_album')}</option>
            {albums.length > 0 ? (
              albums.map((albumOption: { id: string; nomAlbum: string }, index) => (
                <option key={index} value={albumOption.id}>
                  {albumOption.nomAlbum}
                </option>
              ))
            ) : (
              <option value="">{t('form.no_albums')}</option>
            )}
          </select>
        </div>

        {/* Bouton de soumission */}
        <div className="form-group">
          <button type="submit" className="green-button">
            {t('form.upload_photo')}
          </button>
        </div>
      </form>
    </>
  );
};

export default PhotoForm;
