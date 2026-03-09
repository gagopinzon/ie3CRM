import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ProjectInventoryAssignment from '@/models/ProjectInventoryAssignment';

export async function PUT(
  request: Request,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageProjects) {
      return NextResponse.json({ error: 'No tienes permiso para editar asignaciones' }, { status: 403 });
    }

    const body = await request.json();
    const { startDate, endDate, quantity, notes } = body;

    await connectDB();

    const assignment = await ProjectInventoryAssignment.findOneAndUpdate(
      { _id: params.assignmentId, projectId: params.id },
      {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(quantity != null && { quantity: Number(quantity) }),
        ...(notes !== undefined && { notes: notes?.trim() }),
      },
      { new: true, runValidators: true }
    )
      .populate('inventoryItemId', 'name type quantity unit')
      .lean();

    if (!assignment) {
      return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(assignment, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageProjects) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar asignaciones' }, { status: 403 });
    }

    await connectDB();

    const assignment = await ProjectInventoryAssignment.findOneAndDelete({
      _id: params.assignmentId,
      projectId: params.id,
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Asignación eliminada' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
