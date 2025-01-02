import React, { useState } from 'react';

interface PhotoLikeButtonProps {
    photoId: number;
    initialLikesCount: number;
    onLike: (photoId: number) => void; // Déclare `onLike` correctement en tant que fonction
}

const PhotoLikeButton: React.FC<PhotoLikeButtonProps> = ({ photoId, initialLikesCount, onLike }) => {
    const [likesCount, setLikesCount] = useState(initialLikesCount);

    const handleLike = async () => {
        try {
            const response = await fetch(`/photo/${photoId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLikesCount(data.likes);  // Met à jour le nombre de likes
                onLike(photoId);  // Appeler la fonction "onLike" pour informer le parent
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Une erreur est survenue.');
            }
        } catch (error) {
            alert('Une erreur est survenue lors de la tentative de like.');
        }
    };

    return (
        <div className="photo">
            <button className="like-button" onClick={handleLike}>
                ❤️ <span>{likesCount}</span>
            </button>
        </div>
    );
};

export default PhotoLikeButton;
