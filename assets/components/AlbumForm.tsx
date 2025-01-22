import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AlbumForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs du formulaire et les erreurs
  const [albumName, setAlbumName] = useState('');
  const [imagePath, setImagePath] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [flashMessages, setFlashMessages] = useState<string[]>([]);

  // Mettre à jour le `title` de la page
  useEffect(() => {
    document.title = t('form.create_album_title');
  }, [t]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    const newErrors: any = {};

    // Validation du nom de l'album
    if (!albumName) newErrors.albumName = t('form.album_name_required');

    // Si des erreurs existent, on les affiche et on arrête la soumission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Préparer les données du formulaire (multipart/form-data pour l'image)
    const formData = new FormData();
    formData.append('albumName', albumName);
    // Ajouter l'image seulement si elle est présente
    if (imagePath) {
      formData.append('imagePath', imagePath);
    }

    try {
      const response = await fetch('/api/create-album', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Album creation failed');

      setFlashMessages([t('form.album_created_successfully')]);
      setAlbumName('');
      setImagePath(null);
      setErrors({});
    } catch (error) {
      setFlashMessages([t('form.error_message')]);
    }
  };

  // Fonction pour gérer le changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagePath(e.target.files[0]);
    } else {
      setImagePath(null); // Si aucun fichier n'est sélectionné, on réinitialise
    }
  };

  return (
    <>
      <h2>{t('form.create_new_album')}</h2>

      {/* Messages Flash */}
      <div className="form-group">
        {flashMessages.map((msg, index) => (
          <div key={index} className="flash-success">{msg}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Nom de l'album */}
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            name="album_form[nomAlbum]"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            placeholder={t('form.album_name_placeholder')}
          />
          {errors.albumName && <div className="error">{errors.albumName}</div>}
        </div>

        {/* Image */}
        <div className="form-group">
          <input
            className="form-control"
            type="file"
            name="album_form[imagePath]"
            onChange={handleImageChange}
          />
          {errors.imagePath && <div className="error">{errors.imagePath}</div>}
        </div>

        {/* Bouton de création de l'album */}
        <div className="form-group">
          <button type="submit" className="green-button">{t('form.create_album_button')}</button>
        </div>
      </form>
    </>
  );
};

export default AlbumForm;
