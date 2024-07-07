'use server';

import { auth } from '@/auth';
import { getUserById, updateUser } from '@/lib/db';
import { userNameSchema } from '@/lib/validations/user';
import { revalidatePath } from 'next/cache';

export type FormData = {
    name: string;
};

export async function updateUserName(userId: string, data: FormData) {
    try {
        const session = await auth();

        if (!session?.user || session?.user.id !== userId) {
            throw new Error('Unauthorized');
        }

        const { name } = userNameSchema.parse(data);

        const user = await getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        user.name = name;

        await updateUser(userId, user);

        revalidatePath('/dashboard/settings');
        return { status: 'success' };
    } catch (error) {
        console.log(error);
        return { status: 'error' };
    }
}
