import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import InventoriesList from '@/components/inventories/InventoriesList';
import connectDB from '@/lib/mongodb';
import InventoryItem from '@/models/InventoryItem';

async function getInventoryItems() {
  try {
    await connectDB();
    const items = await InventoryItem.find().sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error('Error fetching inventories:', error);
    return [];
  }
}

export default async function InventoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const items = await getInventoryItems();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventarios</h1>
            <p className="text-gray-600 mt-2">
              Materiales y equipos de la compañía para asignar a proyectos
            </p>
          </div>
          <Link
            href="/inventories/new"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
          >
            <Plus size={20} />
            Nuevo ítem
          </Link>
        </div>

        <InventoriesList initialItems={items} />
      </div>
    </DashboardLayout>
  );
}
