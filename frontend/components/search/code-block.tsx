import React, { memo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
    children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
    className,
    children,
    ...props
}) => {
    const ref = useRef<HTMLPreElement>(null);
    const [hasCopied, setHasCopied] = React.useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCopied(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [hasCopied]);

    const handleCopyValue = () => {
        if (ref.current) {
            navigator.clipboard.writeText(ref.current.innerText);
            setHasCopied(true);
        }
    };

    return (
        <div className="relative group">
            <pre
                ref={ref}
                className={`p-0 relative ${className ?? ''}`}
                {...props}
            >
                {children}
            </pre>
            <Button
                size="sm"
                variant="ghost"
                className="absolute right-4 top-4 cursor-pointer z-10 size-[30px] border border-white/25 p-1.5 text-primary-foreground hover:bg-transparent dark:text-foreground"
                onClick={() => handleCopyValue()}
            >
                <span className="sr-only">Copy</span>
                {hasCopied ? (
                    <Icons.check className="size-4 text-white hover:text-primary" />
                ) : (
                    <Icons.copy className="size-4 text-white hover:text-primary" />
                )}
            </Button>
        </div>
    );
};

const MemoizedCodeBlock = memo(CodeBlock);

export default MemoizedCodeBlock;
