import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import DocumentTypesList from '@/components/document-types/DocumentTypesList';
import connectDB from '@/lib/mongodb';
import DocumentType from '@/models/DocumentType';
import Category from '@/models/Category';

async function getDocumentTypes() {
  try {
    await connectDB();
    const documentTypes = await DocumentType.find().populate('category').sort({ name: 1 });
    return JSON.parse(JSON.stringify(documentTypes));
  } catch (error) {
    console.error('Error fetching document types:', error);
    return [];
  }
}

async function getCategories() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function DocumentTypesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const [documentTypes, categories] = await Promise.all([
    getDocumentTypes(),
    getCategories(),
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tipos de Documentos</h1>
            <p className="text-gray-600 mt-2">Gestiona los tipos de documentos disponibles</p>
          </div>
          <Link
            href="/document-types/new"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
          >
            <Plus size={20} />
            Nuevo Tipo
          </Link>
        </div>

        <DocumentTypesList initialDocumentTypes={documentTypes} initialCategories={categories} />
      </div>
    </DashboardLayout>
  );
}
