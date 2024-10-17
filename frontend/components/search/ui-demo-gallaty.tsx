import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';

const DemoGallery = () => {
    const images = [
        {
            src: 'https://image.memfree.me/memfree-generate-ui-case-pricing-page.png',
            user: {
                avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
                name: 'Jane Doe',
            },
            description: 'A Pricing Page for AI Search',
            link: '/share/QdbXqSg23h',
            width: 400,
            height: 300,
            lazy: false,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-wall-of-love.png',
            user: {
                avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
                name: 'John Smith',
            },
            description: 'A wall of love',
            link: '/share/wLPcbKz4Rt',
            width: 400,
            height: 260,
            lazy: false,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-case-landing-page.png',
            user: {
                avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
                name: 'Alice Johnson',
            },
            description: 'A Landing Page for AI Search',
            link: '/share/kyxcWzTBSf',
            width: 2318,
            height: 962,
            lazy: false,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-case-image-payment.png',
            user: {
                avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
                name: 'Bob Wilson',
            },
            description: 'Payment Method UI Generated from Image',
            link: '/share/q7VmaOpsnV',
            width: 1796,
            height: 1430,
            lazy: true,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-image-gallery.png',
            user: {
                avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
                name: 'Bob Wilson',
            },
            description: 'A Image Gallery',
            link: '/share/3dXoyVuz9P',
            width: 2250,
            height: 1340,
            lazy: true,
        },
        {
            src: 'https://image.memfree.me/memfree-generate-ui-case-clone-image.png',
            user: {
                avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
                name: 'Bob Wilson',
            },
            description: 'Clone Any Static Page From Screenshot',
            link: '/share/DrvDXr0Pih',
            width: 2260,
            height: 1076,
            lazy: true,
        },
    ];

    return (
        <div className="container mx-auto px-4 md:px-24 py-6 sm:py-20">
            <h1 className="text-3xl font-bold mb-6 text-center">Showcase</h1>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {images.map((image, index) => (
                    <Link key={index} href={image.link} target="_blank" className="group block break-inside-avoid">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 ease-in-out transform hover:scale-105">
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
                            <div className="p-4 flex items-center bg-white">
                                <Avatar className="size-6 mr-2 flex-shrink-0">
                                    <AvatarImage src={image.user.avatar} alt={image.user.name} />
                                    <AvatarFallback>{image.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DemoGallery;
