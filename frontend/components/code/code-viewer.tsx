'use client';

import React, { useState } from 'react';
import MyMarkdown from '@/components/search/my-markdown';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/shared/share-button';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { Preview } from '@/components/code/preview';

export default function CodeViewer({ code, searchId, isReadOnly }) {
    const [showCode, setShowCode] = useState(false);

    const formattedContent = `\`\`\`jsx\n${code}\n\`\`\``;

    const { hasCopied, copyToClipboard } = useCopyToClipboard();

    return (
        <div className="flex flex-col size-full grow justify-center relative">
            <div className="p-1 flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setShowCode(!showCode)}>
                        {showCode ? 'Preview' : 'View Code'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(code)}>
                        {hasCopied ? 'Copied' : 'Copy Code'}
                    </Button>
                </div>

                {!isReadOnly && (
                    <ShareButton
                        search={{
                            id: searchId,
                        }}
                        onCopy={() => {}}
                        buttonText="Publish"
                        loadingText="Publishing"
                    />
                )}
            </div>
            {showCode && (
                <div className="prose dark:prose-dark w-full max-w-full">
                    <MyMarkdown content={formattedContent} sources={[]} />
                </div>
            )}
            {!showCode && <Preview componentCode={code} />}
        </div>
    );
}
