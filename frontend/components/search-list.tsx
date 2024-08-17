'use client';

import { SearchResult } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
    results: SearchResult[];
    loading: boolean;
}

export default function SearchList({ results, loading }: Props) {
    return (
        <section className="relative">
            <div className="mx-auto max-w-7xl px-5 py-4 md:px-10 md:py-4 lg:py-4">
                {!loading ? (
                    <div className="mb-8 gap-12 py-4 [column-count:1] md:mb-12 md:[column-count:2] lg:mb-16 lg:[column-count:2]">
                        {results.map((item: SearchResult, idx: number) => {
                            return (
                                <Link
                                    href={`${item.url}`}
                                    target="_blank"
                                    key={idx}
                                >
                                    <article className="mb-6 gap-12 overflow-hidden rounded-2xl border-2 border-solid bg-white p-5 shadow-2xl">
                                        <div className="flex justify-center">
                                            <Image
                                                alt={item.title}
                                                src={item.image}
                                                width="320"
                                                height="160"
                                                className="rounded-2xl object-cover shadow-2xl"
                                            />
                                        </div>

                                        <div className="p-4 sm:p-6">
                                            <h3 className="text-md mt-2 whitespace-pre-wrap font-medium">
                                                {item.title}
                                            </h3>

                                            <p className="mt-2 text-sm font-normal text-[#636262]">
                                                {item.text}
                                            </p>
                                        </div>
                                    </article>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mx-auto text-center">
                        Waiting Search Result
                    </div>
                )}
            </div>
        </section>
    );
}
