import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ProjectTask from '@/models/ProjectTask';
import Project from '@/models/Project';

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
    const { title, description, status, order } = body;

    await connectDB();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (status !== undefined) updateData.status = status;
    if (order !== undefined) updateData.order = order;

    const task = await ProjectTask.findOneAndUpdate(
      { _id: params.taskId, projectId: params.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!task) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    // Actualizar progreso del proyecto
    await updateProjectProgress(params.id);

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

    // Actualizar progreso del proyecto
    await updateProjectProgress(params.id);

    return NextResponse.json({ message: 'Tarea eliminada exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateProjectProgress(projectId: string) {
  const tasks = await ProjectTask.find({ projectId });
  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return;
  }

  const doneTasks = tasks.filter((task) => task.status === 'done').length;
  const progress = Math.round((doneTasks / tasks.length) * 100);

  await Project.findByIdAndUpdate(projectId, { progress });
}
