import { ImageSource as BaseImageSource } from '@/lib/types';
import React, { useEffect, useState, memo } from 'react';

interface ExtendedImageSource extends BaseImageSource {
    element: HTMLImageElement;
}

type ImageGalleryProps = {
    initialImages: BaseImageSource[];
};

const ImageGallery: React.FC<ImageGalleryProps> = memo(({ initialImages }) => {
    const [images, setImages] = useState<ExtendedImageSource[]>([]);

    useEffect(() => {
        const loadImage = (
            image: BaseImageSource,
        ): Promise<ExtendedImageSource | null> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ ...image, element: img });
                img.onerror = () => resolve(null);
                img.src = image.image;
            });
        };

        async function validateImages(imageList: BaseImageSource[]) {
            const validImages = await Promise.all(imageList.map(loadImage));

            setImages(
                validImages.filter(
                    (image) => image !== null,
                ) as ExtendedImageSource[],
            );
        }

        validateImages(initialImages);
    }, [initialImages]);

    return (
        <div className="flex max-w-full space-x-2.5 overflow-auto">
            {images.map((image, index) => (
                <a
                    key={index}
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video size-full overflow-hidden hover:scale-110 duration-150 rounded-lg transition-all shadow-md"
                >
                    <img
                        src={image.element.src}
                        alt={image.title}
                        className="size-full object-cover object-top max-h-[80vh]"
                    />
                </a>
            ))}
        </div>
    );
});

ImageGallery.displayName = 'ImageGallery';
export default ImageGallery;
