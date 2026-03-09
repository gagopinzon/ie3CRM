import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import InventoryItem from '@/models/InventoryItem';

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

    const item = await InventoryItem.findById(params.id);

    if (!item) {
      return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
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
      return NextResponse.json({ error: 'No tienes permiso para editar inventarios' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, type, quantity, unit } = body;

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (type !== undefined) updateData.type = type;
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (unit !== undefined) updateData.unit = unit?.trim();

    const item = await InventoryItem.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
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
      return NextResponse.json({ error: 'No tienes permiso para eliminar inventarios' }, { status: 403 });
    }

    await connectDB();

    const ProjectInventoryAssignment = (await import('@/models/ProjectInventoryAssignment')).default;
    const assignmentsCount = await ProjectInventoryAssignment.countDocuments({ inventoryItemId: params.id });

    if (assignmentsCount > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar porque tiene ${assignmentsCount} asignación(es) a proyecto(s)`,
        },
        { status: 400 }
      );
    }

    const item = await InventoryItem.findByIdAndDelete(params.id);

    if (!item) {
      return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ítem eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
