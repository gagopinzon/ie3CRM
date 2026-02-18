import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ProjectTask from '@/models/ProjectTask';
import Project from '@/models/Project';

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

    const tasks = await ProjectTask.find({ projectId: params.id })
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: 1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'El título de la tarea es requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    // Obtener el último orden para esta columna
    const lastTask = await ProjectTask.findOne(
      { projectId: params.id, status: status || 'todo' },
      {},
      { sort: { order: -1 } }
    );
    const nextOrder = lastTask ? lastTask.order + 1 : 0;

    const task = await ProjectTask.create({
      projectId: params.id,
      title: title.trim(),
      description: description?.trim(),
      status: status || 'todo',
      order: nextOrder,
      createdBy: session.user?.id,
    });

    const populatedTask = await ProjectTask.findById(task._id)
      .populate('createdBy', 'name email');

    // Actualizar progreso del proyecto
    await updateProjectProgress(params.id);

    return NextResponse.json(populatedTask, { status: 201 });
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
