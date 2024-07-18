import ReactMarkdown from 'react-markdown';
import RehypeHighlight from 'rehype-highlight';
import RemarkMath from 'remark-math';
import React, { useRef } from 'react';
import RehypeKatex from 'rehype-katex';
import '../../styles/highlight.css';
import 'katex/dist/katex.min.css';
import { TextSource } from '@/lib/types';
import { InlineCitation } from './InlineCitation';
import { useToast } from '../ui/use-toast';
import { Copy } from 'lucide-react';

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
                    key={`inline-citation-${index}`}
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

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
    children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
    className,
    children,
    ...props
}) => {
    const ref = useRef<HTMLPreElement>(null);
    const { toast } = useToast();

    const copyToClipboard = (text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                toast({
                    description: 'Copied to clipboard!',
                });
            })
            .catch((err) => {
                console.error('Failed to copy text: ', err);
            });
    };

    return (
        <div className="relative">
            <pre
                ref={ref}
                className={`pt-4 relative ${className ?? ''}`}
                {...props}
            >
                {children}
            </pre>
            <span
                className="absolute top-4 right-4 cursor-pointer text-white hover:text-primary"
                onClick={() => {
                    if (ref.current) {
                        const code = ref.current.innerText;
                        copyToClipboard(code);
                    }
                }}
            >
                <Copy size={28} />
            </span>
        </div>
    );
};

export default function MyMarkdown({
    content,
    sources,
}: {
    content: string;
    sources: TextSource[];
}) {
    return (
        <ReactMarkdown
            remarkPlugins={[RemarkMath]}
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
                    <CodeBlock {...props}>{children}</CodeBlock>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
