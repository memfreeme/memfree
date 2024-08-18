import ReactMarkdown from 'react-markdown';
import RehypeHighlight from 'rehype-highlight';
import RemarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import React, { memo } from 'react';
import RehypeKatex from 'rehype-katex';
import '@/styles/highlight.css';
import 'katex/dist/katex.min.css';
import { TextSource } from '@/lib/types';
import { InlineCitation } from '@/components/search/inline-citation';
import MemoizedCodeBlock from '@/components/search/code-block';

const processNodeWithCitations = (
    nodeContent: string,
    sources: TextSource[],
) => {
    const matches = Array.from(nodeContent.matchAll(/\[citation:(\d+)\]/g));
    const elements: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    for (const match of matches) {
        const citationNumber = parseInt(match[1], 10);
        const index = match.index as number;

        if (lastIndex < index) {
            elements.push(nodeContent.slice(lastIndex, index));
        }

        if (
            !isNaN(citationNumber) &&
            citationNumber > 0 &&
            citationNumber <= sources.length
        ) {
            elements.push(
                <InlineCitation
                    key={`citation-${index}`}
                    source={sources[citationNumber - 1]}
                    sourceNumber={citationNumber}
                />,
            );
        } else {
            elements.push(`[citation:${citationNumber}]`);
        }

        lastIndex = index + match[0].length;
    }

    if (lastIndex < nodeContent.length) {
        elements.push(nodeContent.slice(lastIndex));
    }

    return elements.filter((element) => element);
};

function MyMarkdown({
    content,
    sources,
}: {
    content: string;
    sources: TextSource[];
}) {
    return (
        <ReactMarkdown
            remarkPlugins={[RemarkMath, remarkGfm]}
            rehypePlugins={[
                RehypeKatex,
                [
                    RehypeHighlight,
                    {
                        detect: false,
                        ignoreMissing: true,
                    },
                ],
            ]}
            components={{
                p: ({ node, ...props }) => {
                    const childrenArray = React.Children.toArray(
                        props.children,
                    );

                    return (
                        <p dir="auto">
                            {childrenArray.map((child, index) => {
                                if (typeof child === 'string') {
                                    return (
                                        <React.Fragment key={index}>
                                            {processNodeWithCitations(
                                                child,
                                                sources,
                                            )}
                                        </React.Fragment>
                                    );
                                } else {
                                    return (
                                        <React.Fragment key={index}>
                                            {child}
                                        </React.Fragment>
                                    );
                                }
                            })}
                        </p>
                    );
                },
                li: ({ node, ...props }) => {
                    const childrenArray = React.Children.toArray(
                        props.children,
                    );

                    return (
                        <li dir="auto">
                            {childrenArray.map((child, index) => {
                                if (typeof child === 'string') {
                                    return (
                                        <React.Fragment key={index}>
                                            {processNodeWithCitations(
                                                child,
                                                sources,
                                            )}
                                        </React.Fragment>
                                    );
                                } else {
                                    return (
                                        <React.Fragment key={index}>
                                            {child}
                                        </React.Fragment>
                                    );
                                }
                            })}
                        </li>
                    );
                },
                pre: ({ node, children, ...props }) => (
                    <MemoizedCodeBlock {...props}>{children}</MemoizedCodeBlock>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

export default memo(MyMarkdown);
