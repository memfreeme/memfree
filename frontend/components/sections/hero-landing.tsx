import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';
import { Icons } from '../shared/icons';

export function HeroLanding() {
    return (
        <section className="space-y-6 py-10 sm:py-20 lg:py-10">
            <div className="container flex max-w-5xl flex-col items-center gap-5 text-center">
                <h1 className="text-balance font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[66px]">
                    Search anything with{' '}
                    <span className="text-gradient_indigo-purple font-extrabold">
                        MemFree
                    </span>
                </h1>

                <p
                    className="max-w-2xl text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8"
                    style={{
                        animationDelay: '0.35s',
                        animationFillMode: 'forwards',
                    }}
                >
                    Instantly Get Accurate Answers from the Internet, Bookmarks,
                    Notes, and Docs
                </p>

                <div className="flex justify-center py-4">
                    <Link
                        href="https://chromewebstore.google.com/detail/memfree/dndjodcanbhkomcgihbhcejogiimdmpk"
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            buttonVariants({ size: 'lg', rounded: 'full' }),
                        )}
                    >
                        <Icons.chrome className="mr-2 size-4" />
                        <p>One Click Index Your Bookmarks and Web Pages</p>
                    </Link>
                </div>
            </div>
        </section>
    );
}
