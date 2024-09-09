import { extractDomain } from '@/lib/utils';
import { ReaderIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React, { memo, useState } from 'react';

const SourceBubble = ({ source, onSelect }) => {
    const site = extractDomain(source.url) as string;
    let faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${site}`;
    if (site === 'Your Knowledge Base') {
        faviconUrl = '/favicon.ico';
    }
    const isVector = source.type === 'vector';

    const [showFullContent, setShowFullContent] = useState(false);

    const isLocalUrl = source.url.startsWith('local-');
    const isX = site.includes('x.com');
    const showSummarize = !isLocalUrl && !isVector && !isX;

    const handleClick = (e) => {
        if (isLocalUrl) {
            e.preventDefault();
            setShowFullContent((prev) => !prev);
        }
    };

    return (
        <div
            className={`relative flex space-x-4 rounded-xl ${isVector ? 'border-2 border-purple-500' : 'border border-gray-300'}  border-solid  dark:border-gray-700 hover:bg-gray-100  dark:hover:bg-gray-800`}
        >
            <article className="max-w-full text-pretty p-4">
                <Link href={source.url} target="_blank" onClick={handleClick}>
                    <div className="flex items-center pb-2">
                        <img src={faviconUrl} alt={`${site} favicon`} className="size-4 mr-2" />
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-50">{site}</p>
                    </div>
                    <h3 className="truncate text-xs text-blue-600 font-medium pb-2">{source.title}</h3>
                </Link>
                <p
                    className={`text-xs ${showFullContent ? 'text-gray-900' : 'overflow-hidden text-gray-600'}  dark:text-gray-50 mr-1`}
                    style={{
                        lineHeight: '1.5em',
                        minHeight: '4.5em',
                        maxHeight: showFullContent ? 'none' : '4.5em',
                    }}
                >
                    {source.content}
                </p>
                {showSummarize && (
                    <div className="absolute bottom-2 right-2">
                        <button
                            type="button"
                            aria-label="Summarize"
                            className="relative text-gray-500 hover:text-primary"
                            onClick={() => onSelect(`please summarize ${source.url}`)}
                        >
                            <ReaderIcon className="peer size-4" />
                            <span className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-1 text-sm text-gray-700 opacity-0  peer-hover:opacity-100">
                                Summarize
                            </span>
                        </button>
                    </div>
                )}
            </article>
        </div>
    );
};

export default memo(SourceBubble);
