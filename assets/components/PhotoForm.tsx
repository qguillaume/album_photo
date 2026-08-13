import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PhotoForm: React.FC = () => {
  const { t } = useTranslation();

  // États pour les champs du formulaire et les erreurs
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]); // Multipostage (superadmin)
  const [album, setAlbum] = useState('');
  const [albums, setAlbums] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [flashMessages, setFlashMessages] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Rôle superadmin => multipostage
  const [uploading, setUploading] = useState(false); // Envoi en cours (multipostage)
  const [progress, setProgress] = useState(''); // Progression de l'envoi par lots
  // Limites d'upload du serveur. Valeurs de repli volontairement prudentes :
  // ce sont les valeurs par défaut de PHP, valables si l'appel API échoue.
  const [limits, setLimits] = useState({
    maxFileUploads: 20,
    postMaxSize: 8 * 1024 * 1024,
  });

  // Récupérer le rôle de l'utilisateur courant (même API que les autres composants)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/current_user');
        if (response.ok) {
          const data = await response.json();
          setIsSuperAdmin((data.roles || []).includes('ROLE_SUPER_ADMIN'));
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Lire les limites d'upload réellement appliquées par le serveur
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await fetch('/api/upload-limits');
        if (response.ok) {
          const data = await response.json();
          if (data.maxFileUploads > 0 && data.postMaxSize > 0) {
            setLimits({
              maxFileUploads: data.maxFileUploads,
              postMaxSize: data.postMaxSize,
            });
          }
        }
      } catch (error) {
        // On garde les valeurs de repli : l'envoi reste fonctionnel.
        console.error('Error fetching upload limits:', error);
      }
    };
    fetchLimits();
  }, []);

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

  // Soumission classique : une seule photo (comportement d'origine, tous les utilisateurs)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: string[] = [];
    if (!title) newErrors.push(t('form.photo_title_required'));
    if (title.length > 30) {
      newErrors.push(t('form.title_max_length', { limit: 30 }));
    }
    if (!file) newErrors.push(t('form.photo_file_required'));
    if (!album) newErrors.push(t('form.photo_album_required'));

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

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

  // PHP limite chaque requête HTTP : nombre de fichiers (max_file_uploads) et
  // poids total (post_max_size). On découpe donc l'envoi en lots successifs qui
  // passent sous ces limites. Les valeurs sont lues sur le serveur (voir
  // /api/upload-limits) plutôt que codées en dur : une constante figée finit
  // toujours par diverger de la config de l'hébergeur, et PHP jette alors les
  // fichiers en trop SANS erreur (c'est ce qui bloquait le multipostage à 20).
  const buildChunks = (list: File[]): File[][] => {
    // Marges de sécurité : on garde de la place pour les autres champs du
    // formulaire et les séparateurs multipart, qui comptent dans post_max_size.
    const maxFiles = Math.max(1, Math.min(15, limits.maxFileUploads - 2));
    const maxBytes = Math.max(1024 * 1024, Math.floor(limits.postMaxSize * 0.8));

    const chunks: File[][] = [];
    let current: File[] = [];
    let currentBytes = 0;
    for (const f of list) {
      const wouldOverflow =
        current.length >= maxFiles ||
        (current.length > 0 && currentBytes + f.size > maxBytes);
      if (wouldOverflow) {
        chunks.push(current);
        current = [];
        currentBytes = 0;
      }
      current.push(f);
      currentBytes += f.size;
    }
    if (current.length > 0) chunks.push(current);
    return chunks;
  };

  // Soumission multipostage : plusieurs photos d'un coup (superadmin uniquement)
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: string[] = [];
    if (files.length === 0) newErrors.push('Veuillez sélectionner au moins une photo.');
    if (files.length > 30) newErrors.push('30 photos maximum par envoi.');
    if (!album) newErrors.push(t('form.photo_album_required'));

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setFlashMessages([]);
    setUploading(true);

    const chunks = buildChunks(files);
    let created = 0;
    const skipped: string[] = [];

    try {
      // Envoi séquentiel des lots (chaque lot respecte les limites PHP)
      for (let i = 0; i < chunks.length; i++) {
        if (chunks.length > 1) {
          setProgress(`Envoi du lot ${i + 1}/${chunks.length}…`);
        }

        const formData = new FormData();
        formData.append('album', album);
        // Nombre de fichiers envoyés : permet au serveur de détecter une
        // troncature silencieuse de PHP au lieu de la laisser passer.
        formData.append('expected', String(chunks[i].length));
        chunks[i].forEach((f) => formData.append('files[]', f));

        const response = await fetch('/api/photos/batch', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Batch upload failed');

        created += data.created || 0;
        if (Array.isArray(data.skipped)) skipped.push(...data.skipped);
      }

      const messages = [`${created} photo(s) ajoutée(s) avec succès.`];
      if (skipped.length > 0) {
        messages.push(`Ignorée(s) car format ou taille non conforme : ${skipped.join(', ')}`);
      }
      setFlashMessages(messages);
      setFiles([]);
      setAlbum('');
    } catch (error: any) {
      const messages = [error.message || t('form.photo_error_message')];
      if (created > 0) {
        messages.unshift(`${created} photo(s) avaient déjà été ajoutées avant l'erreur.`);
      }
      setFlashMessages(messages);
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  // Fonction pour gérer le changement de fichier (mode simple)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  // Fonction pour gérer le changement de fichiers (mode multipostage)
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    } else {
      setFiles([]);
    }
  };

  // Sélecteur d'album (commun aux deux modes)
  const albumSelect = (
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
  );

  const flashBlocks = (
    <>
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

      {flashMessages.length > 0 && (
        <div className="center">
          <div className="flash-success">
            {flashMessages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // ----- Mode multipostage (superadmin) -----
  if (isSuperAdmin) {
    return (
      <>
        <h2>Multipostage de photos</h2>
        <p className="center">Sélectionnez plusieurs photos (30 max) à ajouter dans un même album.</p>

        {flashBlocks}

        <form onSubmit={handleBatchSubmit}>
          <div className="form-group">
            <input
              id="photoFiles"
              className="form-control"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="photoFiles" className="custom-file-label">
              {files.length > 0
                ? `${files.length} photo(s) sélectionnée(s)`
                : t('form.no_file_selected')}
            </label>
          </div>

          <div className="espacement"></div>

          {albumSelect}

          <div className="form-group">
            <button type="submit" className="green-button" disabled={uploading}>
              {uploading ? (progress || 'Envoi en cours…') : 'Publier les photos'}
            </button>
          </div>
        </form>
      </>
    );
  }

  // ----- Mode simple (comportement d'origine, tous les autres utilisateurs) -----
  return (
    <>
      <h2>{t('publish_photo')}</h2>

      {flashBlocks}

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
            id="photoFile"
            className="form-control"
            type="file"
            name="photo_form[file]"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="photoFile" className="custom-file-label">
            {file ? file.name : t('form.no_file_selected')}
          </label>
        </div>

        <div className="espacement"></div>

        {/* Album dynamique */}
        {albumSelect}

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
