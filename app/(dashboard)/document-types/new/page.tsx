import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DocumentTypeForm from '@/components/document-types/DocumentTypeForm';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

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

export default async function NewDocumentTypePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const categories = await getCategories();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Tipo de Documento</h1>
          <p className="text-gray-600 mt-2">Crea un nuevo tipo de documento personalizado</p>
        </div>

        <DocumentTypeForm categories={categories} />
      </div>
    </DashboardLayout>
  );
}
