import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import CategoryForm from '@/components/categories/CategoryForm';

async function getCategoryData(id: string) {
  await connectDB();
  const category = await Category.findById(id);
  return category ? JSON.parse(JSON.stringify(category)) : null;
}

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (!(session.user as any).permissions?.canManageCategories) {
    redirect('/dashboard');
  }

  const category = await getCategoryData(params.id);

  if (!category) {
    redirect('/categories');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Categoría</h1>
          <p className="text-gray-600 mt-2">Modifica la información de la categoría y sus permisos</p>
        </div>

        <CategoryForm initialData={category} />
      </div>
    </DashboardLayout>
  );
}
