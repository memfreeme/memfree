import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function DemoQuestions() {
    const t = useTranslations('DemoQuestions');
    const demoQuestions = [
        {
            title: t('title2'),
            question: t('question2'),
            link: '/share/74ZchTP',
        },
        {
            title: t('title3'),
            question: t('question3'),
            link: '/share/J6y6Vwf',
        },
        {
            title: t('title4'),
            question: t('question4'),
            link: '/share/yoMrqA5',
        },
        {
            title: t('title6'),
            question: t('question6'),
            link: '/share/AjgHzvH',
        },
        {
            title: t('title7'),
            question: t('question7'),
            link: '/share/ucVgsci',
        },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {demoQuestions
                .sort(() => Math.random() - 0.5)
                .slice(0, 4)
                .map((example, index) => (
                    <Link href={example.link} target="_blank">
                        <div
                            key={example.title}
                            className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}
                        >
                            <div className="text-sm font-semibold">
                                {example.title}
                            </div>
                        </div>
                    </Link>
                ))}
        </div>
    );
}
