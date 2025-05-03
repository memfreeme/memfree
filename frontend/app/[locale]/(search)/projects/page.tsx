import ProjectList from '@/components/project/ProjectList';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function ProjectsPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect(`/login`);
    }

    return (
        <div className="group w-full h-lvh mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[320px]">
            <ProjectList></ProjectList>
        </div>
    );
}
