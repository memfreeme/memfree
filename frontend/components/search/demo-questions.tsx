import { useSourceStore } from '@/lib/store';
import { SearchCategory } from '@/lib/types';
import { useTranslations } from 'next-intl';

export function DemoQuestions({ onSelect }) {
    const { setSource } = useSourceStore();
    const t = useTranslations('DemoQuestions');
    const demoQuestions = [
        {
            title: t('title1'),
            question: t('question1'),
            source: SearchCategory.INDIE_MAKER,
        },
        {
            title: t('title2'),
            question: t('question2'),
            source: SearchCategory.ALL,
        },
        {
            title: t('title3'),
            question: t('question3'),
            source: SearchCategory.ALL,
        },
        {
            title: t('title4'),
            question: t('question4'),
            source: SearchCategory.ALL,
        },
        {
            title: t('title5'),
            question: t('question5'),
            source: SearchCategory.ALL,
        },
        {
            title: t('title6'),
            question: t('question6'),
            source: SearchCategory.TWEET,
        },
        {
            title: t('title7'),
            question: t('question7'),
            source: SearchCategory.ALL,
        },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {demoQuestions
                .sort(() => Math.random() - 0.5)
                .slice(0, 4)
                .map((example, index) => (
                    <div
                        key={example.title}
                        onClick={() => {
                            setSource(example.source);
                            onSelect(example.question);
                        }}
                        className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}
                    >
                        <div className="text-sm font-semibold">
                            {example.title}
                        </div>
                    </div>
                ))}
        </div>
    );
}
