'use client';

import React, { useState } from 'react';
import MyMarkdown from '@/components/search/my-markdown';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/shared/share-button';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { Preview } from '@/components/code/preview';

export default function CodeViewer({ code, searchId, isReadOnly }) {
    const [showCode, setShowCode] = useState(false);

    const formattedContent = `\`\`\`jsx\n${code}\n\`\`\``;

    const { hasCopied, copyToClipboard } = useCopyToClipboard();

    return (
        <div className="flex flex-col size-full grow justify-center relative">
            <div className="p-1 flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setShowCode(!showCode)}>
                        {showCode ? 'Preview' : 'View Code'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(code)}>
                        {hasCopied ? 'Copied' : 'Copy Code'}
                    </Button>
                </div>

                {!isReadOnly && (
                    <ShareButton
                        search={{
                            id: searchId,
                        }}
                        onCopy={() => {}}
                        buttonText="Publish"
                        loadingText="Publishing"
                    />
                )}
            </div>
            {showCode && (
                <div className="prose dark:prose-dark w-full max-w-full">
                    <MyMarkdown content={formattedContent} sources={[]} />
                </div>
            )}
            {!showCode && <Preview componentCode={code} />}
        </div>
    );
}

let sharedProps = {
    template: 'react-ts',
    customSetup: {
        dependencies: {
            'lucide-react': 'latest',
            // 'recharts': '2.9.0',
            'react-router-dom': 'latest',
            // '@radix-ui/react-accordion': '^1.2.0',
            // '@radix-ui/react-alert-dialog': '^1.1.1',
            // '@radix-ui/react-aspect-ratio': '^1.1.0',
            // '@radix-ui/react-avatar': '^1.1.0',
            // '@radix-ui/react-checkbox': '^1.1.1',
            // '@radix-ui/react-collapsible': '^1.1.0',
            // '@radix-ui/react-dialog': '^1.1.1',
            // '@radix-ui/react-dropdown-menu': '^2.1.1',
            // '@radix-ui/react-hover-card': '^1.1.1',
            // '@radix-ui/react-label': '^2.1.0',
            // '@radix-ui/react-menubar': '^1.1.1',
            // '@radix-ui/react-navigation-menu': '^1.2.0',
            // '@radix-ui/react-popover': '^1.1.1',
            // '@radix-ui/react-progress': '^1.1.0',
            // '@radix-ui/react-radio-group': '^1.2.0',
            // '@radix-ui/react-select': '^2.1.1',
            // '@radix-ui/react-separator': '^1.1.0',
            // '@radix-ui/react-slider': '^1.2.0',
            // '@radix-ui/react-slot': '^1.1.0',
            // '@radix-ui/react-switch': '^1.1.0',
            // '@radix-ui/react-tabs': '^1.1.0',
            // '@radix-ui/react-toast': '^1.2.1',
            // '@radix-ui/react-toggle': '^1.1.0',
            // '@radix-ui/react-toggle-group': '^1.1.0',
            // '@radix-ui/react-tooltip': '^1.1.2',
            'class-variance-authority': '^0.7.0',
            'clsx': '^2.1.1',
            'date-fns': '^3.6.0',
            'embla-carousel-react': '^8.1.8',
            'react-day-picker': '^8.10.1',
            'tailwind-merge': '^2.4.0',
            'tailwindcss-animate': '^1.0.7',
            'vaul': '^0.9.1',
        },
    },
} as const;

let sharedFiles = {
    // '/lib/utils.ts': shadcnComponents.utils,
    // '/components/ui/accordion.tsx': shadcnComponents.accordian,
    // '/components/ui/alert-dialog.tsx': shadcnComponents.alertDialog,
    // '/components/ui/alert.tsx': shadcnComponents.alert,
    // '/components/ui/avatar.tsx': shadcnComponents.avatar,
    // '/components/ui/badge.tsx': shadcnComponents.badge,
    // '/components/ui/breadcrumb.tsx': shadcnComponents.breadcrumb,
    // '/components/ui/button.tsx': shadcnComponents.button,
    // '/components/ui/calendar.tsx': shadcnComponents.calendar,
    // '/components/ui/card.tsx': shadcnComponents.card,
    // '/components/ui/carousel.tsx': shadcnComponents.carousel,
    // '/components/ui/checkbox.tsx': shadcnComponents.checkbox,
    // '/components/ui/collapsible.tsx': shadcnComponents.collapsible,
    // '/components/ui/dialog.tsx': shadcnComponents.dialog,
    // '/components/ui/drawer.tsx': shadcnComponents.drawer,
    // '/components/ui/dropdown-menu.tsx': shadcnComponents.dropdownMenu,
    // '/components/ui/input.tsx': shadcnComponents.input,
    // '/components/ui/label.tsx': shadcnComponents.label,
    // '/components/ui/menubar.tsx': shadcnComponents.menuBar,
    // '/components/ui/navigation-menu.tsx': shadcnComponents.navigationMenu,
    // '/components/ui/pagination.tsx': shadcnComponents.pagination,
    // '/components/ui/popover.tsx': shadcnComponents.popover,
    // '/components/ui/progress.tsx': shadcnComponents.progress,
    // '/components/ui/radio-group.tsx': shadcnComponents.radioGroup,
    // '/components/ui/select.tsx': shadcnComponents.select,
    // '/components/ui/separator.tsx': shadcnComponents.separator,
    // '/components/ui/skeleton.tsx': shadcnComponents.skeleton,
    // '/components/ui/slider.tsx': shadcnComponents.slider,
    // '/components/ui/switch.tsx': shadcnComponents.switchComponent,
    // '/components/ui/table.tsx': shadcnComponents.table,
    // '/components/ui/tabs.tsx': shadcnComponents.tabs,
    // '/components/ui/textarea.tsx': shadcnComponents.textarea,
    // '/components/ui/toast.tsx': shadcnComponents.toast,
    // '/components/ui/toaster.tsx': shadcnComponents.toaster,
    // '/components/ui/toggle-group.tsx': shadcnComponents.toggleGroup,
    // '/components/ui/toggle.tsx': shadcnComponents.toggle,
    // '/components/ui/tooltip.tsx': shadcnComponents.tooltip,
    // '/components/ui/use-toast.tsx': shadcnComponents.useToast,
    '/public/index.html': `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `,
};
