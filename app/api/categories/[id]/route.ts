import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

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

    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json(category, { status: 200 });
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

    if (!(session.user as any).permissions?.canManageCategories) {
      return NextResponse.json({ error: 'Solo administradores pueden modificar categorías' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, canModify, canView } = body;

    await connectDB();

    const category = await Category.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(canModify !== undefined && { canModify }),
        ...(canView !== undefined && { canView }),
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 400 });
    }
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

    if (!(session.user as any).permissions?.canManageCategories) {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar categorías' }, { status: 403 });
    }

    await connectDB();

    // Verificar si hay tipos de documentos asociados
    const DocumentType = (await import('@/models/DocumentType')).default;
    const documentsCount = await DocumentType.countDocuments({ category: params.id });

    if (documentsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la categoría porque tiene ${documentsCount} tipo(s) de documento(s) asociado(s)` },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(params.id);

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Categoría eliminada exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
