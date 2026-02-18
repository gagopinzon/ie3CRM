import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ProjectDocument from '@/models/ProjectDocument';
import { deleteFromOracle } from '@/lib/oracle-storage';

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

    const document = await ProjectDocument.findById(params.id);

    if (!document) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    // Extract filename from URL for deletion
    const urlParts = document.fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];

    // Delete from Oracle Cloud Storage
    await deleteFromOracle(fileName);

    // Delete from database
    await ProjectDocument.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Documento eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
