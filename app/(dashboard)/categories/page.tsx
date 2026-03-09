import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CategoriesList from '@/components/categories/CategoriesList';
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

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (!(session.user as any).permissions?.canManageCategories) {
    redirect('/dashboard');
  }

  const categories = await getCategories();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
            <p className="text-gray-600 mt-2">Gestiona las categorías de documentos y sus permisos</p>
          </div>
          <Link
            href="/categories/new"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
          >
            <Plus size={20} />
            Nueva Categoría
          </Link>
        </div>

        <CategoriesList initialCategories={categories} />
      </div>
    </DashboardLayout>
  );
}
