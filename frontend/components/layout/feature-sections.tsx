import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const features = [
    {
        header: 'Preview',
        name: 'Real-Time UI Preview',
        description: 'Instantly render and preview generated UI',
        video: 'https://image.memfree.me/memfree-generate-ui-preview.mp4',
        reverse: false,
    },
    {
        header: 'Search',
        name: 'AI-Powered Content Search',
        description: 'Enrich your UI with relevant content using our advanced AI search functionality',
        video: 'https://image.memfree.me/memfree-generate-ui-web-search.mp4',
        reverse: true,
    },
    {
        header: 'Image',
        name: 'Image-Driven UI Generation',
        description: 'Create UI components and pages that closely match your reference images',
        video: 'https://image.memfree.me/memfree-generate-ui-from-image.mp4',
        reverse: false,
    },
    {
        header: 'Shadcn UI',
        name: 'React + TailWind + Shadcn UI Integration',
        description: 'Leverage AI-generated code using the most popular front-end stack: React, TailWind, and Shadcn UI',
        video: 'https://image.memfree.me/memfree-generate-ui-shadcn-ui.mp4',
        reverse: true,
    },
    {
        header: 'Publish',
        name: 'One-Click UI Publishing',
        description: 'Publish and share your UI to the web instantly with a single click',
        video: 'https://image.memfree.me/memfree-generate-ui-publish.mp4',
        reverse: false,
    },
    {
        header: 'Responsive',
        name: 'Responsive Code and Preview',
        description: 'Preview your UI across various devices in real-time, ensuring perfect adaptation to all screen sizes',
        video: 'https://image.memfree.me/memfree-generate-ui-resize.mp4',
        reverse: true,
    },
    {
        header: 'Dark',
        name: 'Dark Mode Code and Preview',
        description: ' Effortlessly generate AI-powered UI code with built-in dark mode support, allowing you to preview both light and dark modes instantly',
        video: 'https://image.memfree.me/memfree-generate-ui-dark-mode.mp4',
        reverse: false,
    },
    {
        header: 'Capture',
        name: 'UI Screenshot Export',
        description: 'Easily export and share your UI designs as high-quality screenshots for seamless collaboration',
        video: 'https://image.memfree.me/memfree-generate-ui-capture-image.mp4',
        reverse: true,
    },
    {
        header: 'Auto',
        name: 'Smart Error Correction',
        description: `While MemFree's advanced AI model and sophisticated code rules strive for perfection, occasional errors may occur. Our Smart Error Correction feature allows you to instantly fix any issues with just one click`,
        video: 'https://image.memfree.me/memfree-generate-ui-auto-fix-error.mp4',
        reverse: false,
    },
];

const FeatureSections = () => {
    return (
        <>
            {features.map((feature) => (
                <section key={feature.header}>
                    <div className="mx-auto px-4 md:px-24 py-6 sm:py-20">
                        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                            <div
                                className={cn('m-auto lg:col-span-2', {
                                    'lg:order-last': feature.reverse,
                                })}
                            >
                                <p className="text-base font-semibold leading-7 text-primary">{feature.header}</p>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">{feature.name}</h2>
                                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">{feature.description}</p>

                                <Link
                                    className={cn(
                                        buttonVariants({
                                            variant: 'default',
                                            size: 'lg',
                                        }),
                                        'mt-8',
                                    )}
                                    href="#hero"
                                    prefetch={false}
                                >
                                    Get Started
                                </Link>
                            </div>
                            <video src={feature.video} autoPlay loop muted className="rounded-xl border m-auto lg:col-span-3 shadow-2xl" />
                        </div>
                    </div>
                </section>
            ))}
        </>
    );
};

export default FeatureSections;
