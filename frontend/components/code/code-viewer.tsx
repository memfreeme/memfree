import React from 'react';
import MyMarkdown from '@/components/search/my-markdown';
import { Preview } from '@/components/code/preview';
import ErrorBoundary from '@/components/code/error-boundary';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { CodeToolbar } from '@/components/code/toolbar';

export default function CodeViewer({ code, searchId, isReadOnly }) {
    const formattedContent = `\`\`\`jsx\n${code}\n\`\`\``;
    return (
        <div className="flex flex-col size-full grow justify-center relative p-1">
            <Tabs className="relative w-full" defaultValue="preview">
                <CodeToolbar isReadOnly={isReadOnly} searchId={searchId} code={code} />
                <TabsContent value="preview">
                    <ErrorBoundary>
                        <Preview componentCode={code} />
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
