'use client';

import { useState } from 'react';

import { Icons } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { siteConfig } from '@/config';

export default function LoginPage() {
    const [signInClicked, setSignInClicked] = useState(false);

    return (
        <div className="mx-auto max-w-sm my-10">
            <div className="flex flex-col items-center justify-center space-y-3 bg-background py-6 text-center">
                <a href={siteConfig.url}>
                    <Icons.brain className="size-10 text-primary" />
                </a>
                <h3 className="font-urban text-2xl font-bold">MemFree</h3>
                <p className="text-md font-medium">
                    Sign in to unlock more features
                </p>
            </div>

            <div className="flex flex-col space-y-6 mx-4 px-4 py-8">
                <Button
                    variant="outline"
                    disabled={signInClicked}
                    onClick={() => {
                        setSignInClicked(true);
                        signIn('google', { callbackUrl: '/' }).then(() => {
                            setSignInClicked(false);
                        });
                    }}
                >
                    {signInClicked ? (
                        <Icons.spinner className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Icons.google className="mr-2 size-4" />
                    )}{' '}
                    Sign In with Google
                </Button>

                <Button
                    variant="outline"
                    disabled={signInClicked}
                    onClick={() => {
                        setSignInClicked(true);
                        signIn('github', { callbackUrl: '/' }).then(() => {
                            setSignInClicked(false);
                        });
                    }}
                >
                    {signInClicked ? (
                        <Icons.spinner className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Icons.gitHub className="mr-2 size-4" />
                    )}{' '}
                    Sign In with Github
                </Button>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{' '}
                <Link
                    href="/terms"
                    target="_blank"
                    className="hover:text-brand underline underline-offset-4"
                >
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                    href="/privacy"
                    target="_blank"
                    className="hover:text-brand underline underline-offset-4"
                >
                    Privacy Policy
                </Link>
            </p>
        </div>
    );
}
