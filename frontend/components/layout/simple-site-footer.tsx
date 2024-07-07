import { Icons } from '../shared/icons';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function SimpleSiteFooter({
    className,
}: React.HTMLAttributes<HTMLElement>) {
    return (
        <footer>
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* <div className="flex justify-center ">
                    <Link href="/" className="flex items-center space-x-2">
                        <Icons.logo></Icons.logo>
                        <span className="font-bold sm:inline-block">
                            {siteConfig.name}
                        </span>
                    </Link>
                </div> */}

                {/* <p className="mx-auto mt-8 max-w-md text-center text-gray-600">
                    {siteConfig.footerDesc}
                </p> */}

                <ul className="mt-8 flex justify-center gap-6 md:gap-8">
                    <li className="mx-4">
                        <Link
                            href={siteConfig.links.github}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icons.gitHub className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    <li className="mx-4">
                        <Link
                            href={siteConfig.links.twitter}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icons.twitter className="size-5 hover:text-primary" />
                        </Link>
                    </li>
                    <li className="mx-4">
                        <a
                            href={siteConfig.links.discord}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icons.discord className="size-5 hover:text-primary" />
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
}
