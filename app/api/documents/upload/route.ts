import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ProjectDocument from '@/models/ProjectDocument';
import { uploadToOracle } from '@/lib/oracle-storage';
import { recalculateProjectProgress } from '@/lib/projects';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageDocuments) {
      return NextResponse.json({ error: 'No tienes permiso para subir documentos' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const documentTypeId = formData.get('documentTypeId') as string;

    if (!file || !projectId || !documentTypeId) {
      return NextResponse.json(
        { error: 'Archivo, proyecto y tipo de documento son requeridos' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 50MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido' },
        { status: 400 }
      );
    }

    await connectDB();

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;

    // Upload to Oracle Cloud Storage
    const fileUrl = await uploadToOracle(buffer, fileName, file.type);

    // Save document metadata to database
    const document = await ProjectDocument.create({
      projectId,
      documentTypeId,
      fileName: file.name,
      fileUrl,
      uploadedBy: (session.user as any).id,
      fileSize: file.size,
    });

    const populatedDocument = await ProjectDocument.findById(document._id)
      .populate('documentTypeId', 'name')
      .populate('uploadedBy', 'name');

    await recalculateProjectProgress(projectId);

    return NextResponse.json(populatedDocument, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: error.message || 'Error al subir el archivo' }, { status: 500 });
  }
}
