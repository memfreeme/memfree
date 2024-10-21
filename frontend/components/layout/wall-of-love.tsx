import React from 'react';
import { Star } from 'lucide-react';

const WallOfLove = () => {
    const reviews = [
        {
            id: 5,
            name: 'Star Boat',
            image: 'https://ph-avatars.imgix.net/6337586/6bacd2f7-00a8-40e9-8725-37a0c92c63eb.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
            comment:
                'MemFree sounds like a game changer for anyone looking to streamline their search experience! I love the idea of a hybrid AI search engine that pulls from both my personal knowledge base and the vast resources of the internet. It’s like having a personal assistant that knows exactly what I need!',
            rating: 5,
        },
        {
            id: 1,
            name: 'Nat R',
            image: 'https://ph-avatars.imgix.net/7636503/a30ae0d8-7a78-4df8-99d0-0f315f96404d.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
            comment: 'I found MemFree by chance and it is awesome! It will become my best ally from now on, it will save me a lot of time.',
            rating: 5,
        },
        {
            id: 2,
            name: 'HelloAvery',
            image: 'https://ph-avatars.imgix.net/7372152/bccd7579-f374-4135-8b6a-d738ad1cdc8b.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
            comment:
                "MemFree looks like it could save me a ton of time. I'm always juggling between my notes and web searches, so having everything in one place sounds awesome. Love that it's open-source too.",
            rating: 5,
        },
        {
            id: 3,
            name: 'Alex',
            image: 'https://ph-avatars.imgix.net/6547614/11a8cf17-e50a-4d69-9027-177d9305515b.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
            comment: 'MemFree has helped me solve problems I encounter daily.Highly recommend!',
            rating: 5,
        },
        {
            id: 4,
            name: 'geekskai',
            image: 'https://ph-avatars.imgix.net/3804241/d0720b38-81b5-4d48-89aa-6a70106344a3.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
            comment: 'It’s great. It’s a great experience to use. The interface interaction is also very natural. It’s worth recommending.',
            rating: 5,
        },
        {
            id: 6,
            name: 'Maxwell Cole',
            image: 'https://ph-avatars.imgix.net/6037615/original.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
            comment:
                'I’m particularly impressed by the variety of formats you can receive answers in—text, mind maps, images, and videos. That flexibility is ideal for different learning styles. Plus, it offers a cost-effective way to access many functionalities typically scattered across multiple tools like ChatGPT Plus and Claude Pro.',
            rating: 5,
        },
    ];

    return (
        <div className="max-w-6xl mx-auto py-20 px-6">
            <h1 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">Wall of Love</h1>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col">
                        <div className="flex items-center mb-4">
                            <img src={review.image} alt={review.name} className="size-12 rounded-full mr-4" />
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{review.name}</h2>
                                <div className="flex">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="size-4 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 grow">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WallOfLove;
