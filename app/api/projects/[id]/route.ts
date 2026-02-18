import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
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

    const project = await Project.findById(params.id)
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name description');

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
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

    const body = await request.json();
    const { name, description, client, documentTypes, kanbanColumn, assignedTo, status } = body;

    await connectDB();

    const project = await Project.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(client && { client }),
        ...(documentTypes !== undefined && { documentTypes }),
        ...(kanbanColumn && { kanbanColumn }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(status && { status }),
        ...(progress !== undefined && { progress: Math.min(100, Math.max(0, progress)) }),
      },
      { new: true, runValidators: true }
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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
