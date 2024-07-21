'use client';

import { Modal } from '@/components/shared/modal';
import { Textarea } from '@/components/ui/textarea';
import { useUploadModal } from '@/hooks/use-upload-modal';
import { useState } from 'react';
import { LoadingButton } from '../ui/loading-button';
import { useUser } from '@/hooks/use-user';
import { cn, isValidUrl } from '@/lib/utils';
import { useToast } from '../ui/use-toast';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';

export const UploadModal = () => {
    const [url, setUrl] = useState('');
    const [islLoading, setLoading] = useState(false);
    const uploadModal = useUploadModal();

    const user = useUser();
    const { toast } = useToast();

    const handleIndex = async () => {
        try {
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
            const indexUrl = `/api/index`;
            setLoading(true);
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
            setLoading(false);

            if (resp.ok) {
                const res = await resp.json();
                console.log('index result: ', res);
                setUrl('');
                toast({
                    description: (
                        <>
                            <div className="font-bold pb-2">
                                It takes several minutes to index the entire
                                content of a web page.
                            </div>
                            <div>You can check the indexing status at</div>
                            <div className="font-bold pt-2">
                                https://www.memfree.me/dashboard
                            </div>
                        </>
                    ),
                });
            }
            uploadModal.onClose();
        } catch (e) {
            setLoading(false);
            uploadModal.onClose();
            console.log('search failed: ', e);
        }
    };

    return (
        <Modal
            showModal={uploadModal.isOpen}
            setShowModal={uploadModal.onClose}
        >
            <div className="grid w-full gap-10 p-10">
                <h3 className="font-semibold text-center">
                    Enhance your search results with AI indexing
                </h3>
                <Textarea
                    placeholder="Please enter the URL of the web pages you value. Memfree will let you search the content of these pages by AI."
                    rows={3}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />

                <LoadingButton
                    className="rounded-full"
                    loading={islLoading}
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
                    <p>Index Chrome BookMarks</p>
                </Link>
            </div>
        </Modal>
    );
};
