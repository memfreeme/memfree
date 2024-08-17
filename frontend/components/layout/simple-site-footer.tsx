import { siteConfig } from '@/config';
import { Icons } from '@/components/shared/icons';
import Link from 'next/link';

export function SimpleSiteFooter() {
    return (
        <footer>
            <div className="mx-auto p-4 pt-10">
                <ul className="mt-8 flex justify-center gap-6 md:gap-8">
                    <li className="mx-2">
                        <Link
                            href={siteConfig.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="MemFree GitHub"
                        >
                            <Icons.gitHub className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    <li className="mx-2">
                        <Link
                            href={siteConfig.links.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="MemFree Twitter"
                        >
                            <Icons.twitter className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    <li className="mx-2">
                        <Link
                            data-featurebase-link
                            href="https://feedback.memfree.me"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="MemFree Feedback"
                        >
                            <Icons.heart className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    <li className="mx-2">
                        <Link
                            href="/docs/extension-user-guide"
                            target="_blank"
                            aria-label="MemFree Browser Extension"
                        >
                            <Icons.chrome className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    <li className="mx-2">
                        <a
                            href={siteConfig.links.discord}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="MemFree Discord"
                        >
                            <Icons.discord className="size-5 hover:text-primary" />
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
}
