import { useTranslations } from 'next-intl';

export function HeroLanding() {
    const t = useTranslations('HomePage');
    return (
        <section className="space-y-6 py-10">
            <div className="container flex flex-col items-center text-center">
                <p className="text-balance text-4xl md:text-5xl font-semibold tracking-tight text-gradient_indigo-purple">{t('hero')}</p>
                <h1 className="opacity-0">{t('hero-h1')}</h1>
                <h2 className=" text-balance leading-normal text-muted-foreground font-semibold sm:text-xl sm:leading-8">{t('hero2')}</h2>
            </div>
        </section>
    );
}
