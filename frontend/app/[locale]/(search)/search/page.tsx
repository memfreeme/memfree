import { redirect } from 'next/navigation';

export default function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const query = searchParams.q;
    if (!query) {
        return redirect('/');
    }
    redirect(`/?q=${query}`);
}
