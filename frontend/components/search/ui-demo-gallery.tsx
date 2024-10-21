import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';

const DemoGallery = () => {
    const images = [
        {
            src: 'https://image.memfree.me/memfree-generate-ui-ai-pricing-page.png',
            user: 'https://randomuser.me/api/portraits/women/2.jpg',
            description: 'A Pricing Page',
            link: '/share/nhC7sRElQh',
            width: 1884,
            height: 1508,
            lazy: false,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-wall-of-love.png',
            user: 'https://randomuser.me/api/portraits/men/1.jpg',
            description: 'A wall of love',
            link: '/share/H13DXoooD5',
            width: 400,
            height: 260,
            lazy: false,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-case-landing-page.png',
            user: 'https://randomuser.me/api/portraits/women/3.jpg',
            description: 'A Landing Page',
            link: '/share/422anMjcvm',
            width: 2318,
            height: 962,
            lazy: false,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-case-image-payment.png',
            user: 'https://randomuser.me/api/portraits/men/4.jpg',
            description: 'Payment Method UI Generated from Image',
            link: '/share/Ycjo4gsLgT',
            width: 1796,
            height: 1430,
            lazy: true,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-image-gallery.png',
            user: 'https://randomuser.me/api/portraits/men/5.jpg',
            description: 'A Image Gallery',
            link: '/share/ZDLk0pqYLl',
            width: 2250,
            height: 1340,
            lazy: true,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-case-clone-image.png',
            user: 'https://randomuser.me/api/portraits/men/6.jpg',
            description: 'Clone Any Static Page From Screenshot',
            link: '/share/suycUClVdH',
            width: 2260,
            height: 1076,
            lazy: true,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-stock-price.png',
            user: 'https://randomuser.me/api/portraits/men/3.jpg',
            description: `Real Stock Price With AI search`,
            link: '/share/FI3zIsKdKk',
            width: 2344,
            height: 940,
            lazy: true,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-profile-image.png',
            user: 'https://randomuser.me/api/portraits/women/1.jpg',
            description: `Profile Card With AI search`,
            link: '/share/eyi7CLcprZ',
            width: 400,
            height: 400,
            lazy: true,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-ppt-search.png',
            user: 'https://randomuser.me/api/portraits/women/1.jpg',
            description: `Generate PPT With AI search`,
            link: '/share/iN0fOIYs9J',
            width: 400,
            height: 400,
            lazy: true,
        },
    ];

    return (
        <div className="container mx-auto px-4 md:px-24 py-6 sm:py-20">
            <h2 className="text-3xl font-bold mb-6 text-center">Showcase</h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {images.map((image, index) => (
                    <Link prefetch={false} key={index} href={image.link} target="_blank" className="group block break-inside-avoid">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 ease-in-out hover:scale-105">
                            <div className="w-full">
                                <Image
                                    src={image.src}
                                    alt={image.description}
                                    width={image.width}
                                    height={image.height}
                                    {...(index === 0 ? { priority: true } : {})}
                                    {...(image.lazy === true ? { loading: 'lazy' } : {})}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="w-full object-cover"
                                />
                            </div>
                            <div className="p-4 flex items-center bg-white dark:bg-black">
                                <Avatar className="size-6 mr-2 shrink-0">
                                    <AvatarImage src={image.user} />
                                    <AvatarFallback>M</AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 line-clamp-2">{image.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DemoGallery;
