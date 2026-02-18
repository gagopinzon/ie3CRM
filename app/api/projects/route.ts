import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

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

    const projects = await Project.find(query)
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name')
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

    const body = await request.json();
    const { name, description, client, documentTypes, kanbanColumn, assignedTo, progress } = body;

    if (!name || !description || !client) {
      return NextResponse.json(
        { error: 'Nombre, descripción y cliente son requeridos' },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.create({
      name,
      description,
      client,
      documentTypes: documentTypes || [],
      kanbanColumn: kanbanColumn || 'Contacted',
      assignedTo: assignedTo || null,
      progress: progress !== undefined ? Math.min(100, Math.max(0, progress)) : 0,
      status: 'active',
    });

    const populatedProject = await Project.findById(project._id)
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name')
      .populate('client', 'companyName rfc');

    return NextResponse.json(populatedProject, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
