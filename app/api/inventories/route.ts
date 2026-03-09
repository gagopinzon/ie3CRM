import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import InventoryItem from '@/models/InventoryItem';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const items = await InventoryItem.find().sort({ name: 1 }).lean();

    const serialized = items.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return NextResponse.json(serialized, { status: 200 });
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

    if (!(session.user as any).permissions?.canManageProjects) {
      return NextResponse.json({ error: 'No tienes permiso para gestionar inventarios' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, type, quantity, unit } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }

    if (!type || !['equipment_return', 'equipment_stays', 'project_material'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    await connectDB();

    const item = await InventoryItem.create({
      name: name.trim(),
      description: description?.trim(),
      type,
      quantity: Math.max(0, Number(quantity) || 0),
      unit: unit?.trim(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
