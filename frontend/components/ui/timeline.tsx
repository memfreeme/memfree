import * as React from 'react';
import { cn } from '@/lib/utils';

const Timeline = React.forwardRef<
    HTMLOListElement,
    React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
    <ol
        ref={ref}
        className={cn(
            'flex flex-col items-center w-11/12 md:w-full',
            className,
        )}
        {...props}
    />
));
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<
    HTMLLIElement,
    React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        className={cn('relative flex flex-col p-6 pt-0 [&>*]:mb-3', className)}
        {...props}
    />
));
TimelineItem.displayName = 'TimelineItem';

const TimelineTime = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(
            'text-sm font-semibold leading-none text-secondary-foreground',
            className,
        )}
        {...props}
    />
));
TimelineTime.displayName = 'TimelineTime';

const TimelineConnector = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'absolute  -translate-x-1/2 translate-y-2 h-full w-px bg-primary',
            className,
        )}
        {...props}
    />
));
TimelineConnector.displayName = 'TimelineConnector';

const TimelineHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center gap-4', className)}
        {...props}
    />
));
TimelineHeader.displayName = 'TimelineHeader';

const TimelineTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            'font-semibold text-2xl leading-none tracking-tight text-secondary-foreground',
            className,
        )}
        {...props}
    >
        {children}
    </h2>
));
TimelineTitle.displayName = 'CardTitle';

const TimelineIcon = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex flex-col size-1 md:size-2 bg-primary rounded-full',
            className,
        )}
        {...props}
    />
));
TimelineIcon.displayName = 'TimelineIcon';

const TimelineDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-muted-foreground max-w-sm', className)}
        {...props}
    />
));
TimelineDescription.displayName = 'TimelineDescription';

const TimelineContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col', className)} {...props} />
));
TimelineContent.displayName = 'TimelineContent';

export {
    Timeline,
    TimelineItem,
    TimelineConnector,
    TimelineHeader,
    TimelineTitle,
    TimelineIcon,
    TimelineDescription,
    TimelineContent,
    TimelineTime,
};
