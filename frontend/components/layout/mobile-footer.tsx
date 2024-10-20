import Link from 'next/link';
import { Settings, HelpCircle, Gem, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewSearchButton } from '@/components/shared/new-search-button';

export function MobileFooter() {
    return (
        <footer className="md:hidden fixed bottom-0 inset-x-0 bg-background py-2">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    {/* <Button variant="ghost" size="icon" aria-label="Settings">
                        <Link href="/settings" aria-label="Settings" data-umami-event="Mobile Settings Click">
                            <Settings className="size-5" />
                        </Link>
                    </Button> */}
                    <Button variant="ghost" size="icon" asChild>
                        <Link
                            data-featurebase-link
                            href="https://feedback.memfree.me"
                            target="_blank"
                            aria-label="MemFree Feedback"
                            data-umami-event="Mobile Feedback Click"
                        >
                            <Heart className="size-5 hover:text-primary" />
                        </Link>
                    </Button>
                    <NewSearchButton variant="icon" umamiEvent="Mobile New Generate UI" type="UI" />

                    <NewSearchButton variant="icon" umamiEvent="Mobile New Search Click" />
                    <Button variant="ghost" size="icon" className="text-primary" asChild>
                        <Link href="/pricing" prefetch={false} data-umami-event="Mobile Footer Pricing Click" aria-label="Pricing">
                            <Gem className="size-5" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/docs" prefetch={false} data-umami-event="Mobile Doc Click" aria-label="Documentation">
                            <HelpCircle className="size-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </footer>
    );
}
