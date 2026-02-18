import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

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

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
