import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const AuthErrorPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <Card className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-center mb-6">
                        <AlertCircle className="size-12 text-red-500" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">Authentication Error</h1>
                    <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                        We&apos;re sorry, but there was an error during the authentication process. Please try again or contact support if the issue persists.
                    </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4">
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">Error Code: AUTH_001 | Time: {new Date().toLocaleTimeString()}</p>
                </div>
            </Card>
        </div>
    );
};

export default AuthErrorPage;
