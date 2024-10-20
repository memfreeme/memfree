import { siteConfig } from '@/config';
import Link from 'next/link';

export function SimpleSiteFooter() {
    return (
        <footer className="hidden md:block mx-auto py-10">
            <div className="flex justify-center items-center h-5 space-x-2 text-sm">
                <Link
                    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:font-semibold"
                    href={siteConfig.links.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="MemFree Discord"
                    data-umami-event="Discord Click"
                >
                    Discord
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:font-semibold"
                    href={siteConfig.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="MemFree GitHub"
                    data-umami-event="Github Link Click"
                >
                    GitHub
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:font-semibold"
                    data-featurebase-link
                    href={siteConfig.links.feedback}
                    target="_blank"
                    aria-label="MemFree Feedback"
                    data-umami-event="Feedback Link Click"
                >
                    Feedback
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:font-semibold"
                    href="/docs"
                    target="_blank"
                    aria-label="MemFree Docs"
                    data-umami-event="Doc Link Click"
                    prefetch={false}
                >
                    Doc
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:font-semibold"
                    href={siteConfig.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="MemFree Twitter"
                    data-umami-event="Twitter Click"
                >
                    Twitter
                </Link>
            </div>
        </footer>
    );
}
