import { PageGenUrl, ReactShadcnUrl, SearchUrl } from '@/config';
import Link from 'next/link';

export function ProductFooter() {
    return (
        <footer className="md:block mx-auto py-10">
            <div className="flex flex-col md:flex-row md:justify-center md:items-center w-full px-4 md:px-0 space-y-2 md:space-y-0 md:space-x-2 text-sm">
                <Link
                    className="font-semibold text-gray-800 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-left md:text-center w-full md:w-auto"
                    href={SearchUrl}
                    target="_blank"
                >
                    Hybrid AI Search
                </Link>
                <span className="text-gray-300 hidden md:block">|</span>
                <Link
                    className="font-semibold text-gray-800 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-left md:text-center w-full md:w-auto"
                    href={PageGenUrl}
                    target="_blank"
                >
                    AI Page Generator
                </Link>
                <span className="text-gray-300 hidden md:block">|</span>
                <Link
                    className="font-semibold text-gray-800 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-left md:text-center w-full md:w-auto"
                    data-featurebase-link
                    href={ReactShadcnUrl}
                >
                    React Shadcn UI Preview
                </Link>
            </div>
        </footer>
    );
}
