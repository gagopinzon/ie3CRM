import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CategoryForm from '@/components/categories/CategoryForm';

export default async function NewCategoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Solo admin puede crear categorías
  if (session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Categoría</h1>
          <p className="text-gray-600 mt-2">Crea una nueva categoría con permisos de roles</p>
        </div>

        <CategoryForm />
      </div>
    </DashboardLayout>
  );
}
