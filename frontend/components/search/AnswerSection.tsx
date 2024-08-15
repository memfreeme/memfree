import React from 'react';
import PropTypes from 'prop-types';
import { BookKey } from 'lucide-react';
import MyMarkdown from './Markdown';

const AnswerSection = ({ content, sources }) => {
    return (
        <div className="flex w-full flex-col items-start space-y-2.5 py-4">
            <div className="flex w-full items-center">
                <BookKey className="text-primary size-22" />
                <h3 className="py-2 text-lg text-primary font-bold">Answer</h3>
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
