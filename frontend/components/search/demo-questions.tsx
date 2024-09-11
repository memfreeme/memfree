import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function DemoQuestions() {
    const t = useTranslations('DemoQuestions');
    const demoQuestions = [
        {
            title: t('title1'),
            link: '/share/Ed21pa5',
        },
        {
            title: t('title2'),
            link: '/share/GgxtPak',
        },
        {
            title: t('title3'),
            link: '/share/cTWwJvL',
        },
        {
            title: t('title4'),
            link: '/share/WreYuQn',
        },
        {
            title: t('title5'),
            link: '/share/WkKsbm8',
        },
        {
            title: t('title6'),
            link: '/share/lXNTOIT',
        },
        {
            title: t('title7'),
            link: '/share/TZ3wyPV',
        },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" dir="auto">
            {demoQuestions
                .sort(() => Math.random() - 0.5)
                .slice(0, 4)
                .map((example) => (
                    <Link key={example.link} href={example.link} target="_blank">
                        <div className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}>
                            <div className="text-sm font-semibold">{example.title}</div>
                        </div>
                    </Link>
                ))}
        </div>
    );
}
