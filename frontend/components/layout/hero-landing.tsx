'use server';

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function HeroLanding() {
    const t = await getTranslations('HomePage');
    return (
        <section className="py-10">
            <div className="flex flex-col items-center text-center space-y-4">
                <h1 className="text-balance text-4xl md:text-5xl font-semibold text-gradient_indigo-purple">{t('hero')}</h1>
                <h2 className="text-balance leading-normal text-muted-foreground font-semibold sm:text-xl sm:leading-8">
                    New Feature:{' '}
                    <Link href="/generate-ui" prefetch={false} className="text-[#6C09C8] dark:text-purple-500 hover:text-purple-600 underline">
                        AI UI Generator
                    </Link>
                </h2>
            </div>
        </section>
    );
}
