import React from 'react';
import PropTypes from 'prop-types';
import ActionButtons from './ActionButtons';
import { BookKey } from 'lucide-react';
import MyMarkdown from './Markdown';

const AnswerSection = ({
    content,
    sources,
    question,
    id,
    message,
    reload,
}) => {
    return (
        <div className="flex w-full flex-col items-start space-y-2.5 py-4">
            <div className="flex w-full items-center">
                <BookKey className="text-primary size-22" />
                <h3 className="py-2 text-lg text-primary font-bold">
                    Answer
                </h3>
            </div>
            <div className="prose dark:prose-dark w-full max-w-full">
                <MyMarkdown content={content} sources={sources} />
            </div>
            <ActionButtons
                content={content}
                question={question}
                id={id}
                message={message}
                reload={reload}
            />
        </div>
    );
};

AnswerSection.propTypes = {
    content: PropTypes.string.isRequired,
    sources: PropTypes.array,
    question: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    message: PropTypes.any,
    deepIntoQuestion: PropTypes.func.isRequired,
};

export default AnswerSection;
