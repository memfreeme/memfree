import React, { useRef } from 'react';
import MyMarkdown from '@/components/search/my-markdown';
import { Preview, PreviewRef } from '@/components/code/preview';
import ErrorBoundary from '@/components/code/error-boundary';
import { CodeToolbar } from '@/components/code/toolbar';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent } from '@/components/ui/tabs';

export default function CodeViewer({ code, searchId, isReadOnly, onSelect }) {
    const cleanCode = code.substring(code.indexOf('import'));
    const formattedContent = `\`\`\`jsx\n${cleanCode}\n\`\`\``;
    const ref = React.useRef<ImperativePanelHandle>(null);
    const previewRef = useRef<PreviewRef>(null);
    return (
        <div className="flex flex-col size-full grow justify-center relative p-1">
            <Tabs className="relative w-full" defaultValue="preview">
                <CodeToolbar isReadOnly={isReadOnly} searchId={searchId} code={cleanCode} resizablePanelRef={ref} previewRef={previewRef} />
                <TabsContent value="preview">
                    <ErrorBoundary>
                        <ResizablePanelGroup direction="horizontal" className="relative z-10">
                            <ResizablePanel ref={ref} className="relative rounded-lg border bg-background" defaultSize={100} minSize={30}>
                                <Preview ref={previewRef} componentCode={cleanCode} onSelect={onSelect} />
                            </ResizablePanel>
                            <ResizableHandle
                                className={cn(
                                    'relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-y-1/2 after:translate-x-[-1px] after:rounded-full after:bg-border after:transition-all after:hover:h-10 sm:block',
                                )}
                            />
                            <ResizablePanel defaultSize={0} minSize={0} />
                        </ResizablePanelGroup>
                    </ErrorBoundary>
                </TabsContent>
                <TabsContent value="code">
                    <div className="prose dark:prose-dark w-full max-w-full">
                        <MyMarkdown content={formattedContent} sources={[]} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
