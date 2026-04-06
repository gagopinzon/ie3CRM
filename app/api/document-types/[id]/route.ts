import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DocumentType from '@/models/DocumentType';

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

    const documentType = await DocumentType.findById(params.id);

    if (!documentType) {
      return NextResponse.json({ error: 'Tipo de documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(documentType, { status: 200 });
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

    if (!(session.user as any).permissions?.canManageDocumentTypes) {
      return NextResponse.json({ error: 'No tienes permiso para editar tipos de documento' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, allowedFileTypes, requiresAddress } = body;

    if (category === '') {
      return NextResponse.json(
        { error: 'Por favor selecciona una categoría' },
        { status: 400 }
      );
    }

    await connectDB();

    const documentType = await DocumentType.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(allowedFileTypes !== undefined && { allowedFileTypes }),
        ...(requiresAddress !== undefined && { requiresAddress }),
      },
      { new: true, runValidators: true }
    );

    if (!documentType) {
      return NextResponse.json({ error: 'Tipo de documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(documentType, { status: 200 });
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

    if (!(session.user as any).permissions?.canManageDocumentTypes) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar tipos de documento' }, { status: 403 });
    }

    await connectDB();

    // Verificar si hay documentos asociados
    const ProjectDocument = (await import('@/models/ProjectDocument')).default;
    const documentsCount = await ProjectDocument.countDocuments({ documentTypeId: params.id });

    if (documentsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el tipo de documento porque tiene ${documentsCount} documento(s) asociado(s)` },
        { status: 400 }
      );
    }

    const documentType = await DocumentType.findByIdAndDelete(params.id);

    if (!documentType) {
      return NextResponse.json({ error: 'Tipo de documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tipo de documento eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
