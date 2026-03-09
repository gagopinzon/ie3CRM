import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectTask from '@/models/ProjectTask';
import { recalculateProjectProgress } from '@/lib/projects';
import { logActivity } from '@/lib/activityLog';

export async function PUT(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status, order, assignedTo, dueDate } = body;

    await connectDB();

    const existingTask = await ProjectTask.findOne({ _id: params.taskId, projectId: params.id })
      .select('title status')
      .lean();
    const previousStatus = existingTask?.status;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (status !== undefined) updateData.status = status;
    if (order !== undefined) updateData.order = order;
    if (assignedTo !== undefined) {
      updateData.assignedTo = Array.isArray(assignedTo) ? assignedTo : assignedTo ? [assignedTo] : [];
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await ProjectTask.findOneAndUpdate(
      { _id: params.taskId, projectId: params.id },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    if (status !== undefined && previousStatus && previousStatus !== status) {
      const project = await Project.findById(params.id).select('name').lean();
      const userId = (session.user as any).id;
      const userName = (session.user as any).name ?? 'Usuario';
      await logActivity({
        type: 'task_status',
        projectId: params.id,
        projectName: (project as any)?.name ?? 'Proyecto',
        entityId: params.taskId,
        entityTitle: (task as any).title ?? existingTask?.title,
        previousValue: previousStatus,
        newValue: status,
        userId,
        userName,
      });
    }

    await recalculateProjectProgress(params.id);

    return NextResponse.json(task, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const task = await ProjectTask.findOneAndDelete({
      _id: params.taskId,
      projectId: params.id,
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    await recalculateProjectProgress(params.id);

    return NextResponse.json({ message: 'Tarea eliminada exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
