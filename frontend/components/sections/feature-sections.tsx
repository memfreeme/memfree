'use client';

import { Icons } from '@/components/shared/icons';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { List } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        id: 'feature-openai',
        header: 'Analyze',
        name: 'Advanced OpenAI API Dashboard',
        description:
            'Just enter your OpenAI API key, and we fetch your data from the OpenAI API directly to create a dashboard. No need to install anything.',
        icon: Icons.openai,
        video: 'https://cdn.llm.report/openai-demo.mp4',
        cta: 'Get Started',
        href: '/login',
        reverse: false,
    },
    {
        id: 'feature-logs',
        header: 'Optimize',
        name: 'Log your prompts and completions',
        description:
            'Change 1 line in your code and start logging your API requests. Optimize your token usage and start saving money.',
        icon: List,
        video: 'https://cdn.llm.report/logs-demo.mp4',
        cta: 'Get Started',
        href: '/login',
        reverse: true,
    },
    {
        id: 'feature-users',
        header: 'Minimize',
        name: 'Measure Cost Per User',
        description:
            'Analyze your cost per user and adjust your pricing to maximize revenue.',
        icon: Icons.user,
        video: 'https://cdn.llm.report/users-demo.mp4',
        cta: 'Get Started',
        href: '/login',
        reverse: false,
    },
];

const FeatureSections = () => {
    return (
        <>
            {features.map((feature) => (
                <section id={feature.id} key={feature.id}>
                    <div className="mx-auto p-6 sm:py-20">
                        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                            <div
                                className={cn('m-auto lg:col-span-2', {
                                    'lg:order-last': feature.reverse,
                                })}
                            >
                                <h2 className="text-base font-semibold leading-7 text-orange-600">
                                    {feature.header}
                                </h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                    {feature.name}
                                </p>
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    {feature.description}
                                </p>
                                <Link
                                    className={cn(
                                        buttonVariants({
                                            variant: 'default',
                                            size: 'lg',
                                        }),
                                        'mt-8',
                                    )}
                                    href={feature.href}
                                >
                                    {feature.cta}
                                </Link>
                            </div>
                            <video
                                src={feature.video}
                                autoPlay
                                loop
                                muted
                                className="rounded-xl border m-auto lg:col-span-3 shadow-2xl"
                            />
                        </div>
                    </div>
                </section>
            ))}
        </>
    );
};

export default FeatureSections;
