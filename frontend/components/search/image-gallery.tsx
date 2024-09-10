import { ImageSource } from '@/lib/types';
import React, { useEffect, useState, memo, useMemo } from 'react';

type ImageGalleryProps = {
    initialImages: ImageSource[];
};

const ImageGallery: React.FC<ImageGalleryProps> = memo(({ initialImages }) => {
    const [images, setImages] = useState<ImageSource[]>([]);
    const loadedImageUrls = useMemo(() => new Set<string>(), []);

    const loadImage = (image: ImageSource): Promise<ImageSource | null> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ ...image });
            };
            img.onerror = (error) => {
                resolve(null);
            };
            img.src = image.image;
        });
    };

    const memoizedInitialImages = useMemo(() => initialImages, [initialImages]);

    useEffect(() => {
        async function validateImages(imageList: ImageSource[]) {
            const imagePromises = imageList.map(loadImage);

            imagePromises.forEach(async (imagePromise) => {
                const result = await imagePromise;
                if (result !== null && !loadedImageUrls.has(result.url)) {
                    loadedImageUrls.add(result.url);
                    setImages((prevImages) => [...prevImages, result]);
                }
            });
        }

        validateImages(memoizedInitialImages);
    }, [loadedImageUrls, memoizedInitialImages]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
                <a
                    key={index}
                    href={image.url}
                    target="_blank"
                    className={`aspect-video size-full overflow-hidden hover:scale-110 duration-150 rounded-lg transition-all ${image.type === 'vector' ? 'border-2 border-purple-500 border-solid' : ''}`}
                >
                    <img src={image.image} alt={image.title} className="size-full object-cover max-h-[80vh]" loading="lazy" />
                </a>
            ))}
        </div>
    );
});

ImageGallery.displayName = 'ImageGallery';
export default ImageGallery;
