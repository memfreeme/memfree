import { extractDomain } from '@/lib/utils';
import { ReaderIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/shared/icons';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';

// Client-only: navigator is unavailable during SSR, so call this from an effect.
const isMacPlatform = () => {
    if (typeof navigator === 'undefined') return false;
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
};

const SourceBubble = ({ source, onSelect }) => {
    const site = extractDomain(source.url) as string;
    let faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${site}`;
    if (site === 'Your Knowledge Base') {
        faviconUrl = '/favicon.ico';
    }
    const isVector = source.type === 'vector';

    const [showFullContent, setShowFullContent] = useState(false);
    const [isMac, setIsMac] = useState(false);
    const { hasCopied, copyToClipboard } = useCopyToClipboard();

    useEffect(() => {
        setIsMac(isMacPlatform());
    }, []);

    const isLocalUrl = source.url.startsWith('local-');
    const isX = site.includes('x.com');
    const showSummarize = !isLocalUrl && !isVector && !isX;
    const canCopyUrl = !isLocalUrl;
    const shortcutHint = isMac ? '⌘C' : 'Ctrl C';

    const handleClick = (e) => {
        if (isLocalUrl) {
            e.preventDefault();
            setShowFullContent((prev) => !prev);
        }
    };

    const t = useTranslations('Search');

    const copyUrl = async () => {
        const ok = await copyToClipboard(source.url);
        if (ok) {
            toast.success(t('copy-url-success'));
        } else {
            toast.error(t('copy-url-error'));
        }
    };

    const handleCopyClick = (e: React.MouseEvent) => {
        // Never let the copy button trigger the card's link navigation.
        e.preventDefault();
        e.stopPropagation();
        copyUrl();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!canCopyUrl) return;
        const modifier = isMac ? e.metaKey : e.ctrlKey;
        const isC = e.key?.toLowerCase() === 'c' || e.code === 'KeyC';
        if (!modifier || !isC || e.shiftKey || e.altKey) return;
        // Preserve native copy when the user has selected text.
        if (window.getSelection()?.toString()) return;
        e.preventDefault();
        copyUrl();
    };

    return (
        <div
            role={canCopyUrl ? 'group' : undefined}
            aria-label={canCopyUrl ? source.title || site : undefined}
            aria-keyshortcuts={canCopyUrl ? (isMac ? 'Meta+C' : 'Control+C') : undefined}
            tabIndex={canCopyUrl ? 0 : undefined}
            onKeyDown={handleKeyDown}
            className={`group relative flex space-x-4 rounded-xl ${isVector ? 'border-2 border-purple-500' : 'border border-gray-300'}  border-solid  dark:border-gray-700 hover:bg-gray-100  dark:hover:bg-gray-800 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
        >
            <article className="max-w-full text-pretty p-4">
                <Link href={source.url} target="_blank" onClick={handleClick}>
                    <div className={`flex items-center pb-2 ${canCopyUrl ? 'pr-16' : ''}`}>
                        <img src={faviconUrl} alt={`${site} favicon`} className="size-4 mr-2" />
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-50">{site}</p>
                    </div>
                    <h3 className="truncate text-xs text-blue-600 font-medium pb-2" dir="auto">
                        {source.title}
                    </h3>
                </Link>
                <p
                    className={`text-xs ${showFullContent ? 'text-gray-900' : 'overflow-hidden text-gray-600'}  dark:text-gray-50 mr-1`}
                    style={{
                        lineHeight: '1.5em',
                        minHeight: '4.5em',
                        maxHeight: showFullContent ? 'none' : '4.5em',
                    }}
                    dir="auto"
                >
                    {source.content}
                </p>
                {canCopyUrl && (
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                        <kbd
                            aria-hidden="true"
                            className="pointer-events-none hidden h-5 select-none items-center rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:inline-flex"
                        >
                            {shortcutHint}
                        </kbd>
                        <button
                            type="button"
                            aria-label={hasCopied ? t('copy-url-success') : t('copy-url')}
                            title={`${t('copy-url')} (${shortcutHint})`}
                            className="rounded p-1 text-gray-500 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={handleCopyClick}
                        >
                            {hasCopied ? <Icons.check className="size-4" /> : <Icons.copy className="size-4" />}
                        </button>
                    </div>
                )}
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
                                {t('summarize')}
                            </span>
                        </button>
                    </div>
                )}
            </article>
        </div>
    );
};

export default memo(SourceBubble);
