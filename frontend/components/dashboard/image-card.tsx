'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Fullscreen, Link as LinkIcon, Download, Loader2 } from 'lucide-react';
import { GenImage } from '@/lib/types';
import React from 'react';
import Link from 'next/link';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { useDownloadImage } from '@/hooks/use-download-image';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/local-store';
import { isProUser } from '@/lib/shared-utils';

const ImageCard = ({ item, isPriority, ischeck }: { item: GenImage; isPriority: boolean; ischeck: boolean }) => {
    const { copyToClipboard } = useCopyToClipboard();
    const { downloadImage, isDownloading } = useDownloadImage();
    const user = useUserStore((state) => state.user);

    const handleCopyToClipboard = async () => {
        if (ischeck && !isProUser(user)) {
            toast.error('You need to be a pro user to copy public image url, please upgrade your plan');
            return;
        }
        await copyToClipboard(item.imageUrl);
        toast.success('Image url copied to clipboard');
    };

    const handleDownloadImage = async () => {
        if (ischeck && !isProUser(user)) {
            toast.error('You need to be a pro user to download public images, please upgrade your plan');
            return;
        }
        await downloadImage(item.imageUrl, `memfree-${item.title.substring(0, 50)}.png`);
    };

    const handlePreview = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (ischeck && !isProUser(user)) {
            e.preventDefault();
            toast.error('You need to be a pro user to preview public images, please upgrade your plan');
        }
    };

    return (
        <Card className="group relative overflow-hidden rounded-xl border border-border/40 hover:border-primary/40 hover:shadow-xl transition-all duration-500 flex flex-col h-full bg-background/50 backdrop-blur-sm">
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
                <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    priority={isPriority}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            </div>

            <div className="p-6 space-y-3 flex-1">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                    <p className="text-sm text-muted-foreground/90 line-clamp-2 group-hover:text-muted-foreground transition-colors duration-300">
                        {item.prompt}
                    </p>
                </div>
            </div>

            <div className="px-2 pb-4">
                <div className="grid grid-cols-3 gap-1">
                    <Link href={item.imageUrl} target="_blank" onClick={handlePreview}>
                        <Button variant="outline" size="icon" className="text-xs w-full">
                            <Fullscreen className="w-4 h-4 mr-1" />
                            Preview
                        </Button>
                    </Link>
                    <Button variant="outline" className="text-xs" onClick={handleCopyToClipboard}>
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Copy
                    </Button>
                    <Button variant="outline" className="text-xs" onClick={handleDownloadImage} disabled={isDownloading}>
                        {isDownloading ? (
                            <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ImageCard;
