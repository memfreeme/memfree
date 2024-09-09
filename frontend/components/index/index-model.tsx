'use client';

import { Modal } from '@/components/shared/modal';
import { useIndexModal } from '@/hooks/use-index-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndexWebPage } from '@/components/index/index-web';
import { FileUploader } from '@/components/index/file-uploader';
import { useUploadFile } from '@/hooks/use-upload-file';
import { useTranslations } from 'next-intl';

export const IndexModal = () => {
    const indexModal = useIndexModal();
    const { onUpload, isUploading: isIndexing } = useUploadFile();

    const t = useTranslations('IndexModal');

    return (
        <Modal showModal={indexModal.isOpen} setShowModal={indexModal.onClose}>
            <div className="grid w-full p-10">
                <div className="mb-6">
                    <h3 className="font-semibold text-center">{t('title')}</h3>
                    <p className="text-center text-xs pt-2 text-gray-500">{t('note')}</p>
                </div>

                <Tabs defaultValue="web">
                    <TabsList className="grid w-full mx-auto grid-cols-2">
                        <TabsTrigger value="web">
                            <div className="flex items-center">
                                <span>{t('web-page')}</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="local">
                            <div className="flex items-center">
                                <span>{t('local-file')}</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="web" className="w-full">
                        <IndexWebPage></IndexWebPage>
                    </TabsContent>
                    <TabsContent value="local" className="w-full">
                        <FileUploader onUpload={onUpload} disabled={isIndexing} />
                    </TabsContent>
                </Tabs>
            </div>
        </Modal>
    );
};
