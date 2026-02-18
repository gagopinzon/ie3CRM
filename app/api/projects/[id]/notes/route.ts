import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ProjectNote from '@/models/ProjectNote';

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

    const notes = await ProjectNote.find({ projectId: params.id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(notes, { status: 200 });
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
    const { content, type } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'El contenido de la nota es requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    const note = await ProjectNote.create({
      projectId: params.id,
      content: content.trim(),
      type: type || 'note',
      createdBy: session.user?.id,
    });

    const populatedNote = await ProjectNote.findById(note._id)
      .populate('createdBy', 'name email');

    return NextResponse.json(populatedNote, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
