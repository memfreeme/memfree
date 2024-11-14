import { PageGenUrl, StorySnapUrl } from '@/config';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';

export async function HeroLanding() {
    const t = await getTranslations('HomePage');
    const isPageGen = Math.random() >= 0.5;

    const PageGenElement = (
        <Link href={PageGenUrl} target="_blank">
            <div className="rounded-full px-6 py-2 flex items-center gap-2 hover:bg-primary/10 transition-all duration-300">
                <Image src="/logo.png" alt="Penguin" width={30} height={30} className="size-6" />
                <span>PageGen - AI Page Generator</span>
                <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium hover:shadow-lg transition-all">
                    Try Free Now
                </span>
            </div>
        </Link>
    );

    const StorySnapElement = (
        <Link href={StorySnapUrl} target="_blank">
            <div className="rounded-full px-6 py-2 flex items-center gap-2 hover:bg-primary/10 transition-all duration-300">
                <Image src="/penguin.png" alt="Penguin" width={30} height={30} className="size-6" />
                <span>Transform Images into Stories with AI</span>
                <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium hover:shadow-lg transition-all">
                    Try Free Now
                </span>
            </div>
        </Link>
    );
    return (
        <section className="py-10">
            <div className="flex flex-col items-center text-center space-y-4">
                <h1 className="text-balance text-4xl md:text-5xl font-bold">{t('hero')}</h1>
                <h2 className="hidden ">MemFree - Hybrid AI Search</h2>
                {isPageGen ? <>{PageGenElement}</> : <>{StorySnapElement}</>}
            </div>
        </section>
    );
}
