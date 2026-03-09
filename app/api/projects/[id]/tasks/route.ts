import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ProjectTask from '@/models/ProjectTask';
import { recalculateProjectProgress } from '@/lib/projects';

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
      .populate('assignedTo', 'name email')
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
    const { title, description, status, documentTypeId, assignedTo, dueDate } = body;
    const assignedIds = Array.isArray(assignedTo) ? assignedTo : assignedTo ? [assignedTo] : [];

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
      ...(documentTypeId && { documentTypeId }),
      title: title.trim(),
      description: description?.trim(),
      status: status || 'todo',
      order: nextOrder,
      ...(assignedIds.length >= 0 && { assignedTo: assignedIds }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      createdBy: session.user?.id,
    });

    const populatedTask = await ProjectTask.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    await recalculateProjectProgress(params.id);

    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
