'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSubscribeModal } from '@/hooks/use-subscribe-modal';

export const Newsletter = () => {
    const [email, setEmail] = useState('');
    const subscribeModal = useSubscribeModal();

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            subscribeModal.onFail();
            subscribeModal.onOpen();
            return;
        }

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.status !== 200) {
                subscribeModal.onFail();
                subscribeModal.onOpen();
            } else {
                const result = await response.json();
                console.log(result);
                subscribeModal.onSuccess();
                subscribeModal.onOpen();
            }
        } catch (error) {
            console.error('Submission failed:', error);
            subscribeModal.onFail();
            subscribeModal.onOpen();
        }
    };

    return (
        <section id="newsletter">
            <div className="container py-24">
                <h3 className="text-center text-4xl md:text-5xl font-bold">
                    Join Our{' '}
                    <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                        Newsletter
                    </span>
                </h3>
                <p className="text-xl text-muted-foreground text-center my-8">
                    Get the latest information about MemFree&apos;s build
                    stories and product releases.
                </p>

                <form
                    className="flex flex-col w-full md:flex-row md:w-6/12 lg:w-4/12 mx-auto gap-4 md:gap-2"
                    onSubmit={handleSubmit}
                >
                    <Input
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="support@memfree.me"
                        className="bg-muted/50 dark:bg-muted/80 md:min-w-[250px]"
                        aria-label="email"
                    />
                    <Button>Subscribe</Button>
                </form>
            </div>
        </section>
    );
};
