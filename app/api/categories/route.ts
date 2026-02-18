import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const categories = await Category.find().sort({ name: 1 });

    return NextResponse.json(categories, { status: 200 });
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

    // Solo admin puede crear categorías
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden crear categorías' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, canModify, canView } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre de la categoría es requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    const category = await Category.create({
      name,
      description,
      canModify: canModify || ['admin', 'project_manager'],
      canView: canView || ['admin', 'project_manager', 'engineer', 'viewer'],
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
