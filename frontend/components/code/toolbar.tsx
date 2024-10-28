import { ShareButton } from '@/components/shared/share-button';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { Camera, Check, ClipboardIcon, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Icons } from '@/components/shared/icons';
import { useCallback, useState } from 'react';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { useUserStore } from '@/lib/store';

export function CodeToolbar({ code, searchId, isReadOnly, resizablePanelRef, previewRef }) {
    const { hasCopied, copyToClipboard } = useCopyToClipboard();
    const [isDark, setIsDark] = useState(false);
    const toggleDarkMode = useCallback(() => {
        if (previewRef.current) {
            previewRef.current.toggleDarkMode();
            setIsDark(previewRef.current.isDaskMode());
        }
    }, [previewRef]);
    const signInModal = useSigninModal();
    const user = useUserStore((state) => state.user);

    const handleCopyToClipboard = useCallback(() => {
        if (user) {
            copyToClipboard(code);
        } else {
            signInModal.onOpen();
        }
    }, [user, copyToClipboard, code, signInModal]);

    const handleCaptureIframe = useCallback(() => {
        if (user) {
            if (previewRef.current) {
                previewRef.current.captureIframe();
            }
        } else {
            signInModal.onOpen();
        }
    }, [user, previewRef, signInModal]);

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
            <div className="flex items-center gap-4 md:pr-[14px]">
                <div className="hidden h-7 items-center gap-1.5 rounded-md border p-2 shadow-sm md:flex">
                    <ToggleGroup
                        type="single"
                        defaultValue="100"
                        onValueChange={(value) => {
                            if (resizablePanelRef.current) {
                                resizablePanelRef.current.resize(parseInt(value));
                            }
                        }}
                    >
                        <ToggleGroupItem value="100" className="size-[22px] rounded-sm p-0">
                            <Monitor className="size-3.5" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="60" className="size-[22px] rounded-sm p-0">
                            <Tablet className="size-3.5" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="30" className="size-[22px] rounded-sm p-0">
                            <Smartphone className="size-3.5" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <Separator orientation="vertical" className="mx-2 hidden h-4 md:flex" />
                <div className="flex items-center space-x-2">
                    <Button
                        size="icon"
                        variant="outline"
                        className="[&_svg]-h-3.5 size-7 rounded-[6px] [&_svg]:w-3.5"
                        onClick={toggleDarkMode}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDark ? <Icons.moon className="size-4 transition-all" /> : <Icons.sun className="size-4 transition-all" />}
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="[&_svg]-h-3.5 size-7 rounded-[6px] [&_svg]:w-3.5"
                        onClick={handleCaptureIframe}
                        aria-label="Capture iframe"
                    >
                        <Camera />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="[&_svg]-h-3.5 size-7 rounded-[6px] [&_svg]:w-3.5"
                        onClick={handleCopyToClipboard}
                        aria-label={hasCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
                    >
                        {hasCopied ? <Check /> : <ClipboardIcon />}
                    </Button>
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
            </div>
        </div>
    );
}
