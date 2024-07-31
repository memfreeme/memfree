'use client';

import { Modal } from '@/components/shared/modal';
import { Textarea } from '@/components/ui/textarea';
import { useIndexModal } from '@/hooks/use-index-modal';
import { useState } from 'react';
import { LoadingButton } from '../ui/loading-button';
import { cn, isValidUrl } from '@/lib/utils';
import { useToast } from '../ui/use-toast';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';
import { useUserStore } from '@/lib/store';

export const IndexModal = () => {
    const [url, setUrl] = useState('');
    const [isLoading, setLoading] = useState(false);
    const uploadModal = useIndexModal();

    const user = useUserStore((state) => state.user);
    const { toast } = useToast();

    const handleIndex = async () => {
        try {
            setLoading(true);
            if (!url.trim()) {
                toast({
                    description: 'Please enter the URL of the web page.',
                });
                return;
            }
            const urls = url
                .split('\n')
                .map((u) => u.trim())
                .filter(Boolean);
            const invalidUrls = urls.filter((u) => !isValidUrl(u));
            if (invalidUrls.length > 0) {
                toast({
                    description: (
                        <>
                            <div className="font-bold pb-2">
                                Please enter valid URLs, they should start with
                                http:// or https://.
                            </div>
                            <div>Your invalid input:</div>
                            <div className="font-bold pt-2">
                                {invalidUrls.join(', ')}
                            </div>
                        </>
                    ),
                });
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
                    toast({
                        description: (
                            <>
                                <div className="font-bold pb-2">
                                    All URLs were successfully indexed!, you
                                    could try to search them now.
                                </div>
                            </>
                        ),
                    });
                } else {
                    setUrl(failedUrls.map((f) => f.url).join('\n'));
                    toast({
                        description: (
                            <>
                                <div className="font-bold pb-2">
                                    Some URLs failed to index.
                                </div>
                                <div>The following URLs failed:</div>
                                <div className="font-bold pt-2">
                                    {failedUrls.map((f) => f.url).join(', ')}
                                </div>
                                <div>You can try indexing them again.</div>
                            </>
                        ),
                    });
                }
            } else {
                const error = await resp.json();
                toast({
                    description: (
                        <>
                            <div className="font-bold pb-2">
                                Indexing failed, please try again.
                            </div>
                            <div>{error.error}</div>
                        </>
                    ),
                });
            }
            setLoading(false);
            uploadModal.onClose();
        } catch (e) {
            setLoading(false);
            uploadModal.onClose();
            console.log('index failed: ', e);
            toast({
                description: (
                    <div className="font-bold pb-2">
                        Indexing failed due to an unexpected error. please try
                        again.
                    </div>
                ),
            });
        }
    };

    return (
        <Modal
            showModal={uploadModal.isOpen}
            setShowModal={uploadModal.onClose}
        >
            <div className="grid w-full gap-10 p-10">
                <div>
                    <h3 className="font-semibold text-center">
                        Enhance your search results with AI indexing
                    </h3>
                    <p className="text-center text-xs pt-2 text-gray-500">
                        It takes about a few seconds to index a web page.
                    </p>
                </div>
                <Textarea
                    placeholder="Please enter the URL of the web pages you value. Memfree will let you search the content of these pages by AI."
                    rows={3}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />

                <LoadingButton
                    className="rounded-full"
                    loading={isLoading}
                    variant={'outline'}
                    onClick={handleIndex}
                >
                    Index Web Page
                </LoadingButton>
                <Link
                    href="https://www.memfree.me/docs/extension-user-guide"
                    target="_blank"
                    className={cn(
                        buttonVariants({
                            rounded: 'full',
                        }),
                    )}
                >
                    <p>Index Web Page By Chrome Extension</p>
                </Link>
                <p className="text-center text-sm">
                    Chrome Extension for faster indexing and better quality
                </p>
            </div>
        </Modal>
    );
};
