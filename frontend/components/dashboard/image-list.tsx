'use client';

import { Loader2 } from 'lucide-react';

import { useState } from 'react';
import { GenImage } from '@/lib/types';
import React from 'react';
import { type User } from 'next-auth';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import ImageCard from '@/components/dashboard/image-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ImageListProps {
    fetcher: (offset: number, limit: number) => Promise<GenImage[]>;
    images?: GenImage[];
    user?: User;
}

const limit = 20;
export const ImageList: React.FC<ImageListProps> = ({ fetcher, images, user }) => {
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(20);
    const [hasMore, setHasMore] = useState(true);
    const [items, setItems] = useState<GenImage[]>(images || []);

    const next = async () => {
        if (!hasMore || loading) return;
        setLoading(true);
        try {
            const newImages = await fetcher(offset, limit);
            if (newImages.length < limit) {
                setHasMore(false);
            }
            setItems((prevItems) => [...prevItems, ...newImages]);
            setOffset((prev) => prev + limit);
        } catch (error) {
            console.error('Failed to fetch images:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {items?.length === 0 && (
                <div className="my-20 py-10 justify-center">
                    <Link href="/generate-image">
                        <Button size="lg" className="bg-primary hover:bg-primary/90">
                            Start Generating Your Image
                        </Button>
                    </Link>
                </div>
            )}
            {items?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                        <ImageCard key={item.id} item={item} isPriority={index <= 2} />
                    ))}
                </div>
            )}

            <InfiniteScroll hasMore={hasMore} isLoading={loading} next={next} threshold={1}>
                {hasMore && (
                    <div className="flex justify-center my-4">
                        <Loader2 className="size-6 text-primary animate-spin mr-2" />
                        <span>Loading More</span>
                    </div>
                )}
            </InfiniteScroll>
        </>
    );
};
