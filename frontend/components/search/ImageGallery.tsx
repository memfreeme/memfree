import { ImageSource } from '@/lib/types';
import React, { useEffect, useState, memo, useMemo } from 'react';

type ImageGalleryProps = {
    initialImages: ImageSource[];
};

const ImageGallery: React.FC<ImageGalleryProps> = memo(({ initialImages }) => {
    const [images, setImages] = useState<ImageSource[]>([]);

    const loadImage = (image: ImageSource): Promise<ImageSource | null> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ ...image });
            };
            img.onerror = (error) => {
                console.error('Image load error:', error);
                resolve(null);
            };
            img.src = image.image;
        });
    };

    async function validateImages(imageList: ImageSource[]) {
        const validImages = await Promise.all(imageList.map(loadImage));
        setImages(
            validImages.filter((image) => image !== null) as ImageSource[],
        );
    }

    const memoizedInitialImages = useMemo(() => initialImages, [initialImages]);

    useEffect(() => {
        validateImages(memoizedInitialImages);
    }, [memoizedInitialImages]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
                <a
                    key={index}
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video size-full overflow-hidden hover:scale-110 duration-150 rounded-lg transition-all shadow-md"
                >
                    <img
                        src={image.image}
                        alt={image.title}
                        className="size-full object-cover max-h-[80vh]"
                    />
                </a>
            ))}
        </div>
    );
});

ImageGallery.displayName = 'ImageGallery';
export default ImageGallery;
