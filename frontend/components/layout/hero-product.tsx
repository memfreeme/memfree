'use server';

import { getTranslations } from 'next-intl/server';

export async function HeroProduct() {
    const t = await getTranslations('HomePage');
    return (
        <section className="py-10">
            <div className="flex flex-col items-center text-center space-y-4">
                <h1 className="text-balance text-4xl md:text-5xl font-semibold text-gradient_indigo-purple">{t('hero')}</h1>
                <h2 className="text-balance leading-normal text-muted-foreground font-semibold sm:text-xl sm:leading-8">{t('hero-product')}</h2>
                <a
                    href="https://www.producthunt.com/posts/memfree?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-memfree"
                    target="_blank"
                >
                    <img
                        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=491138"
                        alt="MemFree - Hybrid&#0032;AI&#0032;Search | Product Hunt"
                        width="250"
                        height="54"
                    />
                </a>
            </div>
        </section>
    );
}
