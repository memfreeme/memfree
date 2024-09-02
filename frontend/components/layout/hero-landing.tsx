import { useTranslations } from 'next-intl';

export function HeroLanding() {
    const t = useTranslations('HomePage');
    return (
        <section className="space-y-6 pb-10">
            <div className="container flex  flex-col items-center gap-5 text-center">
                <h1 className="text-balance text-4xl md:text-6xl font-bold tracking-tight text-gradient_indigo-purple">
                    {t('hero')}
                </h1>

                <h2 className=" text-balance leading-normal text-muted-foreground font-bold sm:text-xl sm:leading-8">
                    {t('hero2')}
                </h2>
            </div>
        </section>
    );
}
