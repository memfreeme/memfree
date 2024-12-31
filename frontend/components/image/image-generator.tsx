'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Check, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TextareaAutosize from 'react-textarea-autosize';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ImageSizeSelector from '@/components/image/image-size-selector';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ImageUseCaseSelector from '@/components/image/image-use-case-selector';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { useUserStore } from '@/lib/store/local-store';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { useDownloadImage } from '@/hooks/use-download-image';
import { isProUser } from '@/lib/shared-utils';

const imageStyles = [
    { value: 'digital_illustration', label: 'Digital' },
    { value: 'realistic_image', label: 'Realistic' },
];

const imageColors = [
    { value: 'default', name: 'Default', color: 'bg-zinc-500' },
    { value: 'red', name: 'Red', color: 'bg-red-500' },
    { value: 'rose', name: 'Rose', color: 'bg-rose-500' },
    { value: 'orange', name: 'Orange', color: 'bg-orange-500' },
    { value: 'green', name: 'Green', color: 'bg-green-500' },
    { value: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { value: 'yellow', name: 'Yellow', color: 'bg-yellow-500' },
    { value: 'violet', name: 'Violet', color: 'bg-violet-500' },
];

export function AIImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [useCase, setUseCase] = useState('social_media_post');
    const [style, setStyle] = useState('realistic_image');
    const [imageColor, setImageColor] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showText, setShowText] = useState(true);
    const user = useUserStore((state) => state.user);
    const [isPublic, setIsPublic] = useState(true);
    const signInModal = useSigninModal();
    const { hasCopied, copyToClipboard } = useCopyToClipboard();

    const [imageSize, setImageSize] = useState({
        selectedSize: 'landscape',
        width: '1024',
        height: '576',
    });

    const handleCopy = useCallback(() => {
        copyToClipboard(generatedImage);
    }, [generatedImage, copyToClipboard]);

    const handleSizeChange = (size: { selectedSize: string; width: string; height: string }) => {
        setImageSize(size);
    };

    const handleUseCaseChange = (useCase) => {
        if (useCase.selectedUseCase === 'custom') {
            setUseCase(useCase.customUseCase || 'social_media_post');
        } else {
            setUseCase(useCase.selectedUseCase);
        }
        console.log('Use case changed', useCase);
    };

    const handleIspublicChange = (checked) => {
        if (!isProUser(user)) {
            toast.error('This feature is only available for Pro users, please upgrade your plan');
            setIsPublic(true);
            return;
        }
        setIsPublic(checked);
    };

    const { downloadImage, isDownloading } = useDownloadImage();

    const handleGenerateImage = async () => {
        if (!prompt) return;

        if (!user) {
            signInModal.onOpen();
            return;
        }

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    style,
                    color: imageColor,
                    size: imageSize,
                    isPublic: isPublic,
                    showText,
                    useCase: useCase,
                }),
            });

            const data = (await response.json()) as { image?: string };

            if (data?.image) {
                setGeneratedImage(data.image);
            } else {
                console.error('No image generated');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to generate image');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isGenerating) {
            intervalId = setInterval(() => {
                setProgress((prevProgress) => {
                    if (prevProgress >= 100) {
                        clearInterval(intervalId);
                        return 100;
                    }
                    return prevProgress + 10;
                });
            }, 1500);
        } else {
            setProgress(0);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isGenerating]);

    return (
        <div className="space-y-6 w-full max-w-3xl mx-auto flex-grow overflow-auto">
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Image Description
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <TextareaAutosize
                    value={prompt}
                    placeholder="Please give some description or keywords for the image"
                    minRows={3}
                    maxRows={6}
                    className="w-full border p-2 text-sm rounded-xl placeholder:text-muted-foreground overflow-y-auto outline-0 ring-0 focus-visible:outline-none focus-visible:ring-0 resize-none"
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Image Use Case</label>
                <ImageUseCaseSelector onUseCaseChange={handleUseCaseChange} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Image Style</label>
                <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Style" />
                    </SelectTrigger>
                    <SelectContent>
                        {imageStyles.map((imageStyle) => (
                            <SelectItem key={imageStyle.value} value={imageStyle.value}>
                                {imageStyle.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Image Size</label>
                <ImageSizeSelector onSizeChange={handleSizeChange} />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium">Image Color</label>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="size-7 rounded-[6px]">
                                <Palette className="size-4" />
                            </Button>
                            <Button variant="outline" className="h-7 px-2 rounded-[6px] flex items-center gap-2">
                                <div className={`size-4 rounded-full ${imageColor ? imageColors.find((c) => c.value === imageColor)?.color : 'bg-gray-300'}`} />
                                <span className="text-xs">{imageColor ? imageColors.find((c) => c.value === imageColor)?.name : 'Auto'}</span>
                            </Button>
                        </div>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-72">
                    <div className="grid grid-cols-2 gap-4 p-2">
                        {imageColors.map((color) => (
                            <DropdownMenuItem
                                key={color.value}
                                onClick={() => setImageColor(color.value)}
                                className="group flex items-center gap-1 cursor-pointer p-2 min-w-[100px] hover:bg-accent hover:text-accent-foreground"
                            >
                                <div className="flex items-center justify-center w-8">
                                    <div
                                        className={`size-6 rounded-full ${color.color} shrink-0 ring-1 ring-border group-hover:ring-border/60 transition-shadow duration-200`}
                                        aria-hidden="true"
                                    />
                                </div>
                                <span className="flex-1 truncate text-sm">{color.name}</span>
                                {imageColor === color.value && <Check className="size-4 shrink-0 ml-auto text-primary" />}
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center space-x-2 mb-1">
                <Switch id="showText" checked={showText} onCheckedChange={(checked) => setShowText(checked)} />
                <Label htmlFor="showText">Show Text In The Image</Label>
            </div>
            <div className="flex items-center space-x-2 mb-1">
                <Switch id="isPublic" checked={isPublic} onCheckedChange={handleIspublicChange} />
                <Label htmlFor="isPublic">Public</Label>
            </div>

            <Button onClick={handleGenerateImage} disabled={!prompt || isGenerating} className="w-full">
                {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>

            {isGenerating && (
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center animate-pulse">
                        {progress < 30
                            ? 'AI is warming up the creative engines...'
                            : progress < 60
                              ? 'Imagination in progress, almost there...'
                              : progress < 90
                                ? 'Final touches being added...'
                                : 'Image generation is completing...'}
                    </p>
                </div>
            )}

            {generatedImage && (
                <div className="flex flex-col space-y-8">
                    <img src={generatedImage} alt="Generated Image" className="object-contain rounded-lg" />

                    <div className="flex justify-center space-x-4 items-center">
                        <Button variant="outline" onClick={handleGenerateImage}>
                            Regenerate
                        </Button>

                        <Button onClick={handleCopy}>{hasCopied ? 'Copied' : 'Copy Image Link'}</Button>

                        <Button
                            variant="secondary"
                            onClick={() => downloadImage(generatedImage, `memfree-generate-image-${Date.now()}.png`)}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Downloading...
                                </>
                            ) : (
                                'Download Image'
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
