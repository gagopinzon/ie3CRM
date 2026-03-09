import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectInventoryAssignment from '@/models/ProjectInventoryAssignment';
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

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const canView = (session.user as any).permissions?.canViewAllProjects || (session.user as any).role === 'admin';
    if (!canView) {
      return NextResponse.json({ error: 'No tienes permiso para ver este proyecto' }, { status: 403 });
    }

    const assignments = await ProjectInventoryAssignment.find({ projectId: params.id })
      .populate('inventoryItemId', 'name type quantity unit')
      .sort({ startDate: 1 })
      .lean();

    const serialized = assignments.map((a: any) => ({
      _id: a._id.toString(),
      projectId: a.projectId?.toString(),
      inventoryItemId: a.inventoryItemId?._id?.toString(),
      inventoryItem: a.inventoryItemId
        ? {
            _id: (a.inventoryItemId as any)._id?.toString(),
            name: (a.inventoryItemId as any).name,
            type: (a.inventoryItemId as any).type,
            quantity: (a.inventoryItemId as any).quantity,
            unit: (a.inventoryItemId as any).unit,
          }
        : null,
      startDate: a.startDate ? new Date(a.startDate).toISOString() : null,
      endDate: a.endDate ? new Date(a.endDate).toISOString() : null,
      quantity: a.quantity,
      notes: a.notes,
    }));

    return NextResponse.json(serialized, { status: 200 });
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

    if (!(session.user as any).permissions?.canManageProjects) {
      return NextResponse.json({ error: 'No tienes permiso para asignar materiales al proyecto' }, { status: 403 });
    }

    const body = await request.json();
    const { inventoryItemId, startDate, endDate, quantity, notes } = body;

    if (!inventoryItemId || !startDate || !endDate || quantity == null || quantity < 1) {
      return NextResponse.json(
        { error: 'inventoryItemId, startDate, endDate y quantity son requeridos' },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const item = await InventoryItem.findById(inventoryItemId);
    if (!item) {
      return NextResponse.json({ error: 'Ítem de inventario no encontrado' }, { status: 404 });
    }

    const assignment = await ProjectInventoryAssignment.create({
      projectId: params.id,
      inventoryItemId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      quantity: Number(quantity),
      notes: notes?.trim(),
    });

    const populated = await ProjectInventoryAssignment.findById(assignment._id)
      .populate('inventoryItemId', 'name type quantity unit')
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
