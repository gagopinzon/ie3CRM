import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DocumentType from '@/models/DocumentType';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const documentTypes = await DocumentType.find().populate('category', 'name').sort({ name: 1 });

    return NextResponse.json(documentTypes, { status: 200 });
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

    if (!(session.user as any).permissions?.canManageDocumentTypes) {
      return NextResponse.json({ error: 'No tienes permiso para crear tipos de documento' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, allowedFileTypes, requiresAddress } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre del tipo de documento es requerido' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Por favor selecciona una categoría' },
        { status: 400 }
      );
    }

    await connectDB();

    const documentType = await DocumentType.create({
      name,
      description,
      category,
      allowedFileTypes: allowedFileTypes || ['documento'],
      requiresAddress: requiresAddress || false,
    });

    return NextResponse.json(documentType, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
