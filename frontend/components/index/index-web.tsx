'use client';

import { LoadingButton } from '@/components/ui/loading-button';
import { buttonVariants } from '@/components//ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { isValidUrl } from '@/lib/shared-utils';
import { useUserStore } from '@/lib/store';
import { useIndexModal } from '@/hooks/use-index-modal';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function IndexWebPage() {
    const [isLoading, setLoading] = useState(false);
    const [url, setUrl] = useState('');
    const user = useUserStore((state) => state.user);
    const indexModal = useIndexModal();

    const handleIndex = async () => {
        try {
            setLoading(true);
            if (!url.trim()) {
                toast.error('Please enter the URL of the web page.');
                setLoading(false);
                return;
            }
            const urls = url
                .split('\n')
                .map((u) => u.trim())
                .filter(Boolean);
            const invalidUrls = urls.filter((u) => !isValidUrl(u));
            if (invalidUrls.length > 0) {
                toast.success(
                    <div className="flex flex-col items-center">
                        <div className="font-bold pb-2">Please enter valid URLs, they should start with http:// or https://</div>
                        <div className="font-bold pt-2">
                            Your invalid input: {}
                            {} {invalidUrls.join(', ')}
                        </div>
                    </div>,
                );
                setLoading(false);
                return;
            }
            const indexUrl = `/api/index2`;

            const resp = await fetch(indexUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    urls: urls,
                    userId: user.id,
                }),
            });

            if (resp.ok) {
                const res = await resp.json();

                const { failedUrls } = res;
                if (failedUrls.length === 0) {
                    setUrl('');
                    toast.success(<div className="font-bold p-2">All URLs were successfully indexed!, you could try to search them now.</div>);
                } else {
                    setUrl(failedUrls.map((f) => f.url).join('\n'));
                    toast.success(
                        <div className="flex flex-col items-center">
                            <div className="font-bold pb-2">Some URLs failed to index.</div>
                            <div>The following URLs failed:</div>
                            <div className="font-bold pt-2">{failedUrls.map((f) => f.url).join(', ')}</div>
                            <div>You can try indexing them again.</div>
                        </div>,
                    );
                }
            } else {
                const error = await resp.json();
                toast.error(
                    <div className="flex flex-col items-center">
                        <div className="font-bold pb-2">Indexing failed, please try again.</div>
                        <div>{error.error}</div>
                    </div>,
                );
            }
            setLoading(false);
            indexModal.onClose();
        } catch (e) {
            setLoading(false);
            indexModal.onClose();
            console.log('index failed: ', e);
            toast.success('Indexing failed due to an unexpected error. please try again');
        }
    };

    const t = useTranslations('IndexWeb');

    return (
        <div className="flex flex-col w-full space-y-6 mt-4">
            <Textarea placeholder={t('placeholder')} rows={3} value={url} onChange={(e) => setUrl(e.target.value)} />
            <LoadingButton className="rounded-full" loading={isLoading} variant={'outline'} onClick={handleIndex}>
                {t('index-button')}
            </LoadingButton>
            <Link
                href="/docs/extension-user-guide"
                target="_blank"
                className={cn(
                    buttonVariants({
                        rounded: 'full',
                    }),
                    'w-full',
                )}
            >
                <span> {t('index-extension')}</span>
            </Link>
            <p className="text-center text-sm">{t('extension-note')}</p>
        </div>
    );
}
