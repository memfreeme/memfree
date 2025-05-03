// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createProject, getProjects } from '@/lib/store/project';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, context, rules } = await req.json();

    try {
        const project = await createProject(session.user.id, title, description, context, rules);
        console.log('Project created:', project);

        return NextResponse.json({ project });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    try {
        const projects = await getProjects(session.user.id, offset, limit);
        return NextResponse.json({ projects });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get projects' }, { status: 500 });
    }
}
