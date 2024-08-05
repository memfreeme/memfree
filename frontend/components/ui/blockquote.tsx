import React from 'react';
import { cn } from '@/lib/utils';

type BlockquoteProps = {
  children?: React.ReactNode;
  className?: string;
};

const Blockquote = ({ children, className }: BlockquoteProps) => {
  return (
    <div
      className={cn(
        "relative rounded-lg border-l-8 border-l-gray-700 bg-gray-100 py-5 pl-16 pr-5 text-lg italic leading-relaxed text-gray-500 before:absolute before:left-3 before:top-3 before:font-serif before:text-6xl before:text-gray-700 before:content-['“']",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BlockquoteAuthor = ({ children, className }: BlockquoteProps) => {
  return (
    <p className={cn('mt-5 pr-4 text-right font-bold not-italic text-gray-700', className)}>
      {children}
    </p>
  );
};

export { Blockquote, BlockquoteAuthor };


// import React from 'react';
// import { Blockquote, BlockquoteAuthor } from '@/components/ui/blockquote';

// const BlockquoteDemo = () => {
//   return (
//     <Blockquote>
//       Happiness lies not in the mere possession of money; it lies in the joy of achievement, in the
//       thrill of creative effort.
//       <BlockquoteAuthor>Franklin Roosevelt</BlockquoteAuthor>
//     </Blockquote>
//   );
// };

// export default BlockquoteDemo;
