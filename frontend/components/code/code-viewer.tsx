import React, { useRef, useState } from 'react';
import { Preview, PreviewRef } from '@/components/code/preview';
import ErrorBoundary from '@/components/code/error-boundary';
import { CodeToolbar } from '@/components/code/toolbar';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { useUserStore } from '@/lib/store';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@/components/code/editor'), {
    loading: () => <p>Loading...</p>,
});

export default function CodeViewer({ code, searchId, isReadOnly, onSelect }) {
    const [activeTab, setActiveTab] = useState('preview');
    const cleanCode = code.substring(code.indexOf('import'));
    const ref = React.useRef<ImperativePanelHandle>(null);
    const previewRef = useRef<PreviewRef>(null);
    const signInModal = useSigninModal();
    const [newCode, setCode] = useState<string>(cleanCode);
    const handleCodeChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
        }
    };
    const user = useUserStore((state) => state.user);
    const onValueChange = (value) => {
        if (value === 'code') {
            if (!user) {
                setActiveTab('preview');
                signInModal.onOpen();
                return;
            } else {
                setActiveTab('code');
                return;
            }
        } else {
            setActiveTab(value);
            return;
        }
    };
    return (
        <div className="flex flex-col size-full grow justify-center relative p-1">
            <Tabs className="relative w-full" value={activeTab} onValueChange={onValueChange}>
                <CodeToolbar isReadOnly={isReadOnly} searchId={searchId} code={newCode} resizablePanelRef={ref} previewRef={previewRef} />
                <TabsContent value="preview">
                    <ErrorBoundary>
                        <ResizablePanelGroup direction="horizontal" className="relative z-10">
                            <ResizablePanel ref={ref} className="relative rounded-lg border bg-background" defaultSize={100} minSize={30}>
                                <Preview ref={previewRef} componentCode={newCode} onSelect={onSelect} />
                            </ResizablePanel>
                            <ResizableHandle
                                className={cn(
                                    'relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-y-1/2 after:-translate-x-px after:rounded-full after:bg-border after:transition-all after:hover:h-10 sm:block',
                                )}
                            />
                            <ResizablePanel defaultSize={0} minSize={0} />
                        </ResizablePanelGroup>
                    </ErrorBoundary>
                </TabsContent>
                <TabsContent value="code">
                    <MonacoEditor defaultValue={newCode} onChange={handleCodeChange} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
