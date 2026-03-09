import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { logActivity } from '@/lib/activityLog';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { projectId, kanbanColumn } = await request.json();

    if (!projectId || !kanbanColumn) {
      return NextResponse.json(
        { error: 'projectId y kanbanColumn son requeridos' },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Project.findById(projectId).select('name kanbanColumn').lean();
    const previousKanban = existing?.kanbanColumn;

    const project = await Project.findByIdAndUpdate(
      projectId,
      { kanbanColumn },
      { new: true }
    )
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name')
      .populate('client', 'companyName rfc');

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    if (previousKanban && previousKanban !== kanbanColumn) {
      const userId = (session.user as any).id;
      const userName = (session.user as any).name ?? 'Usuario';
      await logActivity({
        type: 'project_status',
        projectId: projectId,
        projectName: (project as any).name ?? (existing as any)?.name ?? 'Proyecto',
        entityId: projectId,
        previousValue: previousKanban,
        newValue: kanbanColumn,
        userId,
        userName,
      });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
