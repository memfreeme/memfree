import { siteConfig } from '@/config';
import { Icons } from '@/components/shared/icons';
import Link from 'next/link';
import { BookText } from 'lucide-react';

export function SimpleSiteFooter() {
    return (
        <footer className="hidden md:block mx-auto py-10">
            <ul className="flex justify-center gap-6 md:gap-8">
                <li className="mx-2">
                    <Link
                        href={siteConfig.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="MemFree GitHub"
                        data-umami-event="Github Link Click"
                    >
                        <Icons.gitHub className="size-5 hover:text-primary" />
                    </Link>
                </li>

                <li className="mx-2">
                    <Link
                        data-featurebase-link
                        href="https://feedback.memfree.me"
                        target="_blank"
                        aria-label="MemFree Feedback"
                        data-umami-event="Feedback Link Click"
                    >
                        <Icons.heart className="size-5 hover:text-primary" />
                    </Link>
                </li>
                <li className="mx-2">
                    <Link href="/docs" target="_blank" aria-label="MemFree Docs" data-umami-event="Doc Link Click">
                        <BookText className="size-5 hover:text-primary" />
                    </Link>
                </li>
            </ul>
        </footer>
    );
}
