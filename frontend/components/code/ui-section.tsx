import React from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

const MyMarkdown = dynamic(() => import('@/components/search/my-markdown'), {
    loading: () => <p>Loading...</p>,
});

const CodeViewer = dynamic(() => import('@/components/code/code-viewer'), {
    loading: () => <p>Loading...</p>,
});

const UISection = ({ content, searchId, isLoading, isReadOnly, onSelect }) => {
    const formattedContent = `\`\`\`jsx\n${content}\n\`\`\``;
    return (
        <div className="flex w-full flex-col items-start space-y-2.5">
            <div className="prose dark:prose-dark w-full max-w-full">{isLoading && <MyMarkdown content={formattedContent} sources={[]} />}</div>

            {!isLoading && <CodeViewer code={content} searchId={searchId} isReadOnly={isReadOnly} onSelect={onSelect} />}
        </div>
    );
};

UISection.propTypes = {
    content: PropTypes.string.isRequired,
};

export default UISection;
