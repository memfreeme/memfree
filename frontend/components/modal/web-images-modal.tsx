import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export interface WebImageFile {
    url: string;
    type: 'image';
    name: string;
    size: number;
}

interface WebImageUrlModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImagesAdded: (images: WebImageFile[]) => void;
}

const WebImageModal: React.FC<WebImageUrlModalProps> = ({ open, onOpenChange, onImagesAdded }) => {
    const [imageUrls, setImageUrls] = useState<string[]>(['']);
    const [previews, setPreviews] = useState<string[]>([]);
    const [urlValidities, setUrlValidities] = useState<boolean[]>([false]);

    const isValidImageUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
            return validExtensions.some((ext) => urlObj.pathname.toLowerCase().endsWith(ext));
        } catch {
            return false;
        }
    };

    const checkImageValidity = async (url: string): Promise<boolean> => {
        if (!isValidImageUrl(url)) return false;

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };

    const updateUrlInput = async (index: number, value: string) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);

        if (value.trim()) {
            const isValid = await checkImageValidity(value);
            const newValidities = [...urlValidities];
            newValidities[index] = isValid;
            setUrlValidities(newValidities);

            const newPreviews = [...previews];
            if (isValid) {
                newPreviews[index] = value;
            } else {
                newPreviews[index] = '';
            }
            setPreviews(newPreviews);
        }
    };

    const addUrlInput = () => {
        setImageUrls((prev) => [...prev, '']);
        setUrlValidities((prev) => [...prev, false]);
        setPreviews((prev) => [...prev, '']);
    };

    const removeUrlInput = (index: number) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        const newValidities = urlValidities.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        setImageUrls(newUrls);
        setUrlValidities(newValidities);
        setPreviews(newPreviews);
    };

    const handleImageUrlSubmit = async () => {
        const validUrls = imageUrls.filter((_, index) => urlValidities[index]);

        if (validUrls.length === 0) {
            toast.error('Please enter valid image URLs');
            return;
        }

        try {
            const newUploadedFiles: WebImageFile[] = validUrls.map((url) => ({
                url,
                type: 'image',
                name: `web-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                size: 1,
            }));

            onImagesAdded(newUploadedFiles);

            setImageUrls(['']);
            setUrlValidities([false]);
            setPreviews([]);
            onOpenChange(false);

            toast.success(`${validUrls.length} image(s) added successfully`);
        } catch (error) {
            toast.error('Failed to add image URLs');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl mx-auto">
                <DialogHeader>
                    <DialogTitle>Add Public Web Image URLs</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="flex space-x-2 items-center">
                            <div className="flex-grow">
                                <Input
                                    value={url}
                                    onChange={(e) => updateUrlInput(index, e.target.value)}
                                    placeholder="Enter image URL"
                                    className={`
                                        ${urlValidities[index] ? 'border-green-500' : url.trim() ? 'border-red-500' : ''}
                                    `}
                                />
                            </div>
                            <Button className="size-6" variant="ghost" size="icon" onClick={() => removeUrlInput(index)}>
                                <X />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addUrlInput} className="w-full">
                        + Add Another Image
                    </Button>
                    <p className="text-xs text-muted-foreground">Supported Image Formats: JPG, PNG, WebP, GIF</p>

                    {previews.some((preview) => preview) && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {previews.map(
                                (preview, index) =>
                                    preview && <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded" />,
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleImageUrlSubmit} disabled={!urlValidities.some((validity) => validity)}>
                        Add Images
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WebImageModal;
