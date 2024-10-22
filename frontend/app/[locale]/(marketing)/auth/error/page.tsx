import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const AuthErrorPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <Card className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-center mb-6">
                        <AlertCircle className="size-12 text-red-500" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">Some Error</h1>
                    <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                        We&apos;re sorry, but there was an error during the authentication process. Please try again or contact support if the issue persists.
                    </p>
                    <div className="mt-8 flex flex-col space-y-4 mx-auto">
                        <Link href="/login" prefetch={false} className={cn(buttonVariants({ size: 'lg', rounded: 'full' }))}>
                            Login Again
                        </Link>
                        <Link href="/" prefetch={false} className={cn(buttonVariants({ size: 'lg', rounded: 'full', variant: 'ghost' }))}>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AuthErrorPage;
