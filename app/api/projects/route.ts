import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectTask from '@/models/ProjectTask';
import DocumentType from '@/models/DocumentType';
import { resolveOrCreateClientId, recalculateProjectProgress } from '@/lib/projects';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const kanbanColumn = searchParams.get('kanbanColumn');

    const query: any = {};
    if (kanbanColumn) {
      query.kanbanColumn = kanbanColumn;
    }
    if (!(session.user as any).permissions?.canViewAllProjects) {
      query.$or = [{ assignedTo: (session.user as any).id }, { assignedTo: null }];
    }

    const projects = await Project.find(query)
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name')
      .populate('client', 'companyName rfc')
      .sort({ createdAt: -1 });

    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageProjects) {
      return NextResponse.json({ error: 'No tienes permiso para crear proyectos' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, client, documentTypes, kanbanColumn, assignedTo } = body;

    if (!name || !description || !client) {
      return NextResponse.json(
        { error: 'Nombre, descripción y cliente son requeridos' },
        { status: 400 }
      );
    }

    await connectDB();

    const clientId = await resolveOrCreateClientId(client);

    const project = await Project.create({
      name,
      description,
      client: clientId,
      documentTypes: documentTypes || [],
      kanbanColumn: kanbanColumn || 'Contacted',
      assignedTo: assignedTo || null,
      status: 'active',
    });

    const projectId = project._id.toString();
    const docTypes = Array.isArray(documentTypes) ? documentTypes : [];
    const userId = session.user?.id;
    if (docTypes.length > 0 && userId) {
      for (let i = 0; i < docTypes.length; i++) {
        const docTypeId = docTypes[i];
        if (!docTypeId) continue;
        const docType = await DocumentType.findById(docTypeId).select('name').lean();
        if (!docType) continue;
        await ProjectTask.create({
          projectId: project._id,
          documentTypeId: docTypeId,
          title: docType.name,
          status: 'todo',
          order: i,
          createdBy: userId,
        });
      }
    }

    await recalculateProjectProgress(projectId);

    const populatedProject = await Project.findById(project._id)
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name')
      .populate('client', 'companyName rfc');

    return NextResponse.json(populatedProject, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
