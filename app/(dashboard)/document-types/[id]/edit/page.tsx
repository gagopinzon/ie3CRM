import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import DocumentType from '@/models/DocumentType';
import Category from '@/models/Category';
import DocumentTypeForm from '@/components/document-types/DocumentTypeForm';

async function getDocumentTypeData(id: string) {
  await connectDB();
  const documentType = await DocumentType.findById(id).populate('category');
  return documentType ? JSON.parse(JSON.stringify(documentType)) : null;
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

export default async function EditDocumentTypePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const [documentType, categories] = await Promise.all([
    getDocumentTypeData(params.id),
    getCategories(),
  ]);

  if (!documentType) {
    redirect('/document-types');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Tipo de Documento</h1>
          <p className="text-gray-600 mt-2">Modifica la información del tipo de documento</p>
        </div>

        <DocumentTypeForm categories={categories} initialData={documentType} />
      </div>
    </DashboardLayout>
  );
}
