import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ProjectNote from '@/models/ProjectNote';
import { commitDateOnlyToStorage } from '@/lib/dateOnly';

export async function PUT(
  request: Request,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { content, eventDate } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'El contenido de la nota es requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    const update: Record<string, unknown> = { content: content.trim() };
    if (eventDate != null && eventDate !== '') {
      const d = commitDateOnlyToStorage(String(eventDate));
      if (d) update.eventDate = d;
    } else {
      (update as any).$unset = { eventDate: 1 };
    }

    const note = await ProjectNote.findOneAndUpdate(
      { _id: params.noteId, projectId: params.id },
      update,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(note, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const note = await ProjectNote.findOneAndDelete({
      _id: params.noteId,
      projectId: params.id,
    });

    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Nota eliminada exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
