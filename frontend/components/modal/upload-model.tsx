'use client';

import { Modal } from '@/components/shared/modal';
import { Textarea } from '@/components/ui/textarea';
import { useUploadModal } from '@/hooks/use-upload-modal';
import { useState } from 'react';
import { LoadingButton } from '../ui/loading-button';
import { useUser } from '@/hooks/use-user';
import { isValidUrl } from '@/lib/utils';
import { useToast } from '../ui/use-toast';

export const UploadModal = () => {
    const [url, setUrl] = useState('');
    const [islLoading, setLoading] = useState(false);
    const uploadModal = useUploadModal();

    const user = useUser();
    const { toast } = useToast();

    const handleIndex = async () => {
        try {
            if (!isValidUrl(url)) {
                toast({
                    description: 'Please enter a valid URL',
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
                    urls: [url],
                    userId: user.id,
                }),
            });
            setLoading(false);

            if (resp.ok) {
                const res = await resp.json();
                console.log('index result: ', res);
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
            <div className="grid w-full gap-10 my-10 p-10">
                <Textarea
                    placeholder="Please enter the URL of the web pages you value. Memfree will create an AI index for this page."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />

                <LoadingButton
                    variant="default"
                    loading={islLoading}
                    onClick={handleIndex}
                >
                    Index Web Page
                </LoadingButton>
            </div>
        </Modal>
    );
};
