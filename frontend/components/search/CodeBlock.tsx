import React, { memo, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CopyButton } from '../shared/copy-button';

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
    children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
    className,
    children,
    ...props
}) => {
    const ref = useRef<HTMLPreElement>(null);
    const [copyValue, setCopyValue] = useState<string>('');

    useEffect(() => {
        if (ref.current) {
            setCopyValue(ref.current.innerText);
        }
    }, [ref.current]);

    return (
        <div className="relative group">
            <pre
                ref={ref}
                className={`p-0 relative ${className ?? ''}`}
                {...props}
            >
                {children}
            </pre>
            <CopyButton
                value={copyValue}
                className={cn('absolute right-4 top-4 cursor-pointer')}
            />
        </div>
    );
};

const MemoizedCodeBlock = memo(CodeBlock);

export default MemoizedCodeBlock;
