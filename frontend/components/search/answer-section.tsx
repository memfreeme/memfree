import React from 'react';
import PropTypes from 'prop-types';
import { BookKey } from 'lucide-react';
import dynamic from 'next/dynamic';

const MyMarkdown = dynamic(() => import('@/components/search/my-markdown'), {
    loading: () => <p>Loading...</p>,
});

const AnswerSection = ({ title, content, sources }) => {
    return (
        <div className="flex w-full flex-col items-start space-y-2.5">
            <div className="flex items-center space-x-2">
                <BookKey className="text-primary size-22" />
                <h3 className="py-2 text-lg text-primary font-bold">{title}</h3>
            </div>
            <div className="prose dark:prose-dark w-full max-w-full">
                <MyMarkdown content={content} sources={sources} />
            </div>
        </div>
    );
};

AnswerSection.propTypes = {
    content: PropTypes.string.isRequired,
    sources: PropTypes.array,
};

export default AnswerSection;
