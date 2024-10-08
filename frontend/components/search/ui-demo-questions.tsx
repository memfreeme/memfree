import Link from 'next/link';

export function UIDemos() {
    const demoQuestions = [
        {
            title: 'A Landing Page',
            link: '/share/kyxcWzTBSf',
        },
        {
            title: 'A Pricing Page',
            link: '/share/QdbXqSg23h',
        },
        {
            title: 'A Interactive SAAS Pricing Calculator',
            link: '/share/iUVbhSTwK9',
        },
        {
            title: 'A Wall Of Love ',
            link: '/share/wLPcbKz4Rt',
        },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" dir="auto">
            {demoQuestions.map((example) => (
                <Link key={example.link} href={example.link} target="_blank">
                    <div className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}>
                        <div className="text-sm font-semibold">{example.title}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
