import { getLatestPublicImages } from '@/lib/store/image';
import { ImageList } from '@/components/dashboard/image-list';
import { siteConfig } from '@/config';
import { Metadata } from 'next/types';

const seoTitle = 'Recraft-v3 AI Generated Image Show | MemFree AI';
const description = 'Recraft-v3 AI Generated Image Show | MemFree AI';
const url = siteConfig.url + '/image-show';

export const metadata: Metadata = {
    title: seoTitle,
    description: description,
    alternates: {
        canonical: url,
    },
    twitter: {
        card: 'summary_large_image',
        site: url,
        title: seoTitle,
        description: description,
        images: '/og.png',
        creator: '@MemFree',
    },
};

export default async function MyPages() {
    const images = await getLatestPublicImages();

    return (
        <div className="flex flex-col items-center justify-between space-y-6 px-4 mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold py-10">MemFree Public Image Gallery</h1>
            </div>
            <ImageList user={null} images={images} fetcher={getLatestPublicImages} />
        </div>
    );
}
