'use client';

import { Modal } from '@/components/shared/modal';
import { useIndexModal } from '@/hooks/use-index-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndexWebPage } from '@/components/index/index-web';
import { IndexLocalFile } from '@/components/index/index-local-file';

export const IndexModal = () => {
    const indexModal = useIndexModal();

    return (
        <Modal showModal={indexModal.isOpen} setShowModal={indexModal.onClose}>
            <div className="grid w-full p-10">
                <div className="mb-6">
                    <h3 className="font-semibold text-center">
                        Enhance your search results with AI indexing
                    </h3>
                    <p className="text-center text-xs pt-2 text-gray-500">
                        It takes about a few seconds to index a web page or
                        local file.
                    </p>
                </div>

                <Tabs defaultValue="web">
                    <TabsList className="grid w-full mx-auto grid-cols-2">
                        <TabsTrigger value="web">
                            <div className="flex items-center">
                                <span>Web Page</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="local">
                            <div className="flex items-center">
                                <span>Local File</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="web" className="w-full">
                        <IndexWebPage></IndexWebPage>
                    </TabsContent>
                    <TabsContent value="local" className="w-full">
                        <IndexLocalFile></IndexLocalFile>
                    </TabsContent>
                </Tabs>
            </div>
        </Modal>
    );
};
