import React, { useEffect, useState } from 'react';
import PhotoControls from './PhotoControls';

interface Photo {
    id: number;
    title: string;
    url: string;
    likesCount: number;
    isOwner: boolean;
}

interface PhotoAlbumProps {
    photos: Photo[];
}

const PhotoAlbum: React.FC<PhotoAlbumProps> = ({ photos }) => {
    const [likes, setLikes] = useState<Map<number, number>>(new Map());

    // Mise à jour du nombre de likes à partir de l'initialisation de la page
    useEffect(() => {
        const initialLikes = new Map<number, number>();
        photos.forEach(photo => {
            initialLikes.set(photo.id, photo.likesCount);
        });
        setLikes(initialLikes);
    }, [photos]);

    // Fonction pour liker une photo
    const handleLike = async (photoId: number) => {
        try {
            const response = await fetch(`/photo/${photoId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Erreur lors du like');
                return;
            }

            // Met à jour le nombre de likes après le succès
            const updatedLikes = new Map(likes);
            updatedLikes.set(photoId, updatedLikes.get(photoId)! + 1);
            setLikes(updatedLikes);
        } catch (error) {
            alert('Une erreur est survenue.');
        }
    };

    return (
        <div className="photo-album">
            {photos.map((photo) => {
                return (
                    <div key={photo.id} className="photo-item">
                        <img
                            src={photo.url}
                            alt={photo.title}
                            className="photo-thumbnail"
                        />
                        <div className="photo-info">
                            <h4>{photo.title}</h4>
                            <p>{likes.get(photo.id)} likes</p>
                            <button onClick={() => handleLike(photo.id)}>
                                Like
                            </button>

                            <PhotoControls
                                photoId={photo.id}
                                photoTitle={photo.title}
                                photoUrl={photo.url}
                                initialLikesCount={likes.get(photo.id) || 0}
                                onRename={() => {}}
                                onDelete={() => {}}
                                onLike={() => {}}
                                photoPath={photo.url}
                                isOwner={photo.isOwner}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PhotoAlbum;
