import { useTranslations } from 'next-intl';

export function HeroLanding() {
    const t = useTranslations('HomePage');
    return (
        <section className="py-10">
            <div className="flex flex-col items-center text-center space-y-4">
                <h1 className="text-balance text-4xl md:text-5xl font-semibold text-gradient_indigo-purple">{t('hero')}</h1>
                <h2 className=" text-balance leading-normal text-muted-foreground font-semibold sm:text-xl sm:leading-8">{t('hero2')}</h2>
            </div>
        </section>
    );
}
