import { auth } from '@/auth';

export async function getCurrentUser() {
    const session = await auth();
    console.log('getCurrentUser session ', session);
    return session?.user;
}
