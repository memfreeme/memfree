import { ShareButton } from '@/components/shared/share-button';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { Check, ClipboardIcon } from 'lucide-react';

export function CodeToolbar({ code, searchId, isReadOnly }) {
    const { hasCopied, copyToClipboard } = useCopyToClipboard();
    return (
        <div className="flex justify-between items-center my-6">
            <div className="flex items-center gap-2">
                <TabsList className="h-7 rounded-md p-0 px-[calc(theme(spacing.1)_-_2px)] py-[theme(spacing.1)] sm:flex">
                    <TabsTrigger value="preview" className="h-[1.45rem] rounded-sm px-2 text-xs">
                        Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="h-[1.45rem] rounded-sm px-2 text-xs">
                        Code
                    </TabsTrigger>
                </TabsList>
            </div>
            <div className="flex items-center gap-2 md:pr-[14px]">
                {!isReadOnly && (
                    <div className="flex items-center space-x-2">
                        <Button
                            size="icon"
                            variant="outline"
                            className="[&_svg]-h-3.5 h-7 w-7 rounded-[6px] [&_svg]:w-3.5"
                            onClick={() => copyToClipboard(code)}
                        >
                            {hasCopied ? <Check /> : <ClipboardIcon />}
                        </Button>
                        <ShareButton
                            search={{
                                id: searchId,
                            }}
                            onCopy={() => {}}
                            buttonText="Publish"
                            loadingText="Publishing"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
