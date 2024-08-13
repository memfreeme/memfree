import { extractDomain } from '@/lib/utils';
import Link from 'next/link';
import React, { memo } from 'react';

const SourceBubble = ({ source }) => {
    const site = extractDomain(source.url);
    const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${site}`;
    const isVector = source.type === 'vector';
    return (
        <Link href={source.url} target="_blank">
            <div
                className={`flex space-x-4 rounded-xl ${isVector ? 'border-2 border-purple-500' : 'border border-gray-300'}  border-solid  dark:border-gray-700 hover:bg-gray-100  dark:hover:bg-gray-800`}
            >
                <article className="max-w-full text-pretty p-4">
                    <div className="flex items-center pb-2">
                        <img
                            src={faviconUrl}
                            alt={`${site} favicon`}
                            className="size-4 mr-2"
                        />
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-50">
                            {site}
                        </p>
                    </div>
                    <h3 className="truncate text-xs text-blue-600 font-medium pb-2">
                        {source.title}
                    </h3>
                    <p
                        className="text-xs overflow-hidden text-gray-600 dark:text-gray-50"
                        style={{
                            lineHeight: '1.5em',
                            minHeight: '4.5em',
                            maxHeight: '4.5em',
                        }}
                    >
                        {source.content}
                    </p>
                </article>
            </div>
        </Link>
    );
};

export default memo(SourceBubble);
