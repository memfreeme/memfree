import { extractDomain } from '@/lib/utils';

export function SourceBubble({ source }) {
    const site = extractDomain(source.url);
    const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${site}`;
    return (
        <div
            onClick={async () => {
                window.open(source.url, '_blank');
            }}
            className={`h-full cursor-pointer self-stretch overflow-hidden rounded-lg border bg-card text-card-foreground shadow-md relative hover:scale-105 hover:text-primary duration-300`}
        >
            <div className="p-5">
                <div className="flex items-center justify-between pb-2">
                    <p className="text-xs">{site}</p>
                    <img
                        src={faviconUrl}
                        alt={`${site} favicon`}
                        className="size-4"
                    />
                </div>
                <h3 className="text-sm font-normal truncate">{source.title}</h3>
            </div>
        </div>
    );
}
