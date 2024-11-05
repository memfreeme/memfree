'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { getRandomImage } from '@/components/blog/random-image';

interface LastBlogCardProps {
    href: string;
    title: string;
    description: string;
    date: string;
    readTime?: string;
}

export default function LatestBlogCard({ href, title, description, date, readTime = '8 min read' }: LastBlogCardProps) {
    return (
        <Link href={href} className="block w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="overflow-hidden bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative h-64 md:h-full overflow-hidden">
                                <img
                                    src={getRandomImage()}
                                    alt={title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>

                            <div className="p-6 flex flex-col justify-between h-full">
                                <div className="py-10">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 transition-transform duration-300 group-hover:translate-x-2">
                                        {title}
                                    </h2>

                                    <p className="text-gray-600 dark:text-gray-300 mt-6 line-clamp-3">{description}</p>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 pb-10">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>{date}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>{readTime}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    );
}
