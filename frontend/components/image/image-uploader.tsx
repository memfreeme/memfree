'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { uploadSingleFile } from '@/lib/uploader';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    showGeneratedImage?: boolean;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [image, setImage] = useState<string | null>(value);

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const response = await uploadSingleFile(file);
            onChange(response.url);
            setImage(response.url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
        },
        maxFiles: 1,
    });
    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-lg overflow-hidden
        transition-colors duration-200
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200'}
        ${isUploading ? 'pointer-events-none' : ''}
      `}
            >
                <input {...getInputProps()} />

                {isUploading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}

                {image ? (
                    <div className="relative group">
                        <img src={image} alt="Uploaded content" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white text-sm">Click or drag to replace</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        {isDragActive ? (
                            <p className="text-primary">Drop the image here...</p>
                        ) : (
                            <>
                                <p>Click or drag image to upload</p>
                                <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
