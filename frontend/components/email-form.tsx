import { signIn } from 'next-auth/react';
import { Icons } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { useState } from 'react';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailForm() {
    const [signInClicked, setSignInClicked] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const handleSignIn = async (event) => {
        event.preventDefault();
        try {
            if (!emailPattern.test(email)) {
                setError('Please enter a valid email');
                return;
            } else {
                setError('');
            }

            setSignInClicked(true);
            signIn('resend', { callbackUrl: '/', email: email }).then(() => {
                setSignInClicked(false);
            });
        } catch (error) {
            setError('Something went wrong. Please try again.');
            setSignInClicked(false);
            console.error('Error:', error);
        }
    };

    return (
        <form onSubmit={handleSignIn}>
            <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {error && <span className="text-red-500 my-1">{error}</span>}
            <Button type="submit" className="w-full mt-4">
                {signInClicked ? (
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                ) : (
                    <Mail className="mr-2 size-4" />
                )}{' '}
                Continue with Email
            </Button>
        </form>
    );
}
