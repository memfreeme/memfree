import { Icons } from '../shared/icons';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function SimpleSiteFooter({
    className,
}: React.HTMLAttributes<HTMLElement>) {
    return (
        <footer>
            <div className="mx-auto p-4 pt-24">
                <ul className="mt-8 flex justify-center gap-6 md:gap-8">
                    <li className="mx-4">
                        <Link
                            href={siteConfig.links.github}
                            target="_blank"
                            aria-label="MemFree GitHub"
                        >
                            <Icons.gitHub className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    <li className="mx-4">
                        <Link
                            href="https://feedback.memfree.me"
                            target="_blank"
                            aria-label="MemFree Feedback"
                        >
                            <Icons.heart className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    <li className="mx-4">
                        <Link
                            href="https://chromewebstore.google.com/detail/memfree/dndjodcanbhkomcgihbhcejogiimdmpk"
                            target="_blank"
                            aria-label="MemFree Browser Extension"
                        >
                            <Icons.chrome className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    {/* <li className="mx-4">
                        <Link
                            href={siteConfig.links.twitter}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="MemFree Twitter"
                        >
                            <Icons.twitter className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    <li className="mx-4">
                        <a
                            href={siteConfig.links.discord}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="MemFree Discord"
                        >
                            <Icons.discord className="size-5 hover:text-primary" />
                        </a>
                    </li> */}
                </ul>
            </div>
        </footer>
    );
}
