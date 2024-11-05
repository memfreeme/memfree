'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { getRandomImage } from '@/components/blog/random-image';

interface BlogCardProps {
    href: string;
    title: string;
    description: string;
    date: string;
    readTime?: string;
}

export default function BlogCard({ href, title, description, date, readTime = '5 min read' }: BlogCardProps) {
    return (
        <Link href={href} className="block size-full max-w-sm mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="h-full">
                <Card className="overflow-hidden bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={getRandomImage()}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    <CardContent className="p-6 flex flex-col flex-grow">
                        <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100 transition-transform duration-300 group-hover:translate-x-2">
                            {title}
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3  flex-grow">{description}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-auto">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{date}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{readTime}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    );
}
