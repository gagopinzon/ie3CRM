import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectTask from '@/models/ProjectTask';
import DocumentType from '@/models/DocumentType';
import { resolveOrCreateClientId, recalculateProjectProgress } from '@/lib/projects';
import { logActivity } from '@/lib/activityLog';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const project = await Project.findById(params.id)
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name description');

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const canViewAll = (session.user as any).permissions?.canViewAllProjects;
    const assignedToId = (project as any).assignedTo?._id?.toString?.() ?? (project as any).assignedTo?.toString?.();
    if (!canViewAll && assignedToId && assignedToId !== (session.user as any).id) {
      return NextResponse.json({ error: 'No tienes permiso para ver este proyecto' }, { status: 403 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageProjects) {
      return NextResponse.json({ error: 'No tienes permiso para editar proyectos' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, client, documentTypes, kanbanColumn, assignedTo, status, locationAddress, locationLat, locationLng } = body;

    await connectDB();

    const existing = await Project.findById(params.id).select('name kanbanColumn').lean();
    const previousKanban = existing?.kanbanColumn;

    const update: Record<string, unknown> = {
      ...(name && { name }),
      ...(description && { description }),
      ...(documentTypes !== undefined && { documentTypes }),
      ...(kanbanColumn && { kanbanColumn }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(status && { status }),
      ...(locationAddress !== undefined && { locationAddress: locationAddress || null }),
      ...(locationLat !== undefined && { locationLat: locationLat ?? null }),
      ...(locationLng !== undefined && { locationLng: locationLng ?? null }),
    };
    if (client) {
      update.client = await resolveOrCreateClientId(client);
    }

    const project = await Project.findByIdAndUpdate(
      params.id,
      update,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name')
      .populate('client', 'companyName rfc');

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    if (kanbanColumn && previousKanban && previousKanban !== kanbanColumn) {
      const userId = (session.user as any).id;
      const userName = (session.user as any).name ?? 'Usuario';
      await logActivity({
        type: 'project_status',
        projectId: params.id,
        projectName: (project as any).name ?? existing?.name ?? 'Proyecto',
        entityId: params.id,
        previousValue: previousKanban,
        newValue: kanbanColumn,
        userId,
        userName,
      });
    }

    // Sincronizar pasos: por cada tipo de documento asignado, crear un paso en "Por hacer" si aún no existe
    const userId = session.user?.id;
    if (documentTypes && Array.isArray(documentTypes) && documentTypes.length > 0 && userId) {
      const existingByDocType = await ProjectTask.find({
        projectId: params.id,
        documentTypeId: { $in: documentTypes },
      }).distinct('documentTypeId');
      const existingSet = new Set(existingByDocType?.map((id) => id?.toString()) ?? []);

      for (const docTypeId of documentTypes) {
        if (!docTypeId || existingSet.has(docTypeId.toString())) continue;
        const docType = await DocumentType.findById(docTypeId).select('name').lean();
        if (!docType) continue;

        const lastTodo = await ProjectTask.findOne(
          { projectId: params.id, status: 'todo' },
          {},
          { sort: { order: -1 } }
        );
        const nextOrder = lastTodo ? lastTodo.order + 1 : 0;

        await ProjectTask.create({
          projectId: params.id,
          documentTypeId: docTypeId,
          title: docType.name,
          status: 'todo',
          order: nextOrder,
          createdBy: userId,
        });
        existingSet.add(docTypeId.toString());
      }
    }

    await recalculateProjectProgress(params.id);

    const updatedProject = await Project.findById(project._id)
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name')
      .populate('client', 'companyName rfc');

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageProjects) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar proyectos' }, { status: 403 });
    }

    await connectDB();

    const project = await Project.findByIdAndDelete(params.id);

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Proyecto eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
