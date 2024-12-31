import { getLatestPublicImages} from '@/lib/store/image';
import { ImageList } from '@/components/dashboard/image-list';

export default async function MyPages() {
    const images = await getLatestPublicImages();

    return (
        <div className="flex flex-col items-center justify-between space-y-6 px-4 mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold py-10">MemFree Public Image Gallery</h1>
            </div>
            <ImageList user={{}} images={images} fetcher={getLatestPublicImages} />
        </div>
    );
}
