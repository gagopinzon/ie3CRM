import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import InventoryItem from '@/models/InventoryItem';
import InventoryItemForm from '@/components/inventories/InventoryItemForm';

async function getInventoryItem(id: string) {
  await connectDB();
  const item = await InventoryItem.findById(id).lean();
  return item ? JSON.parse(JSON.stringify(item)) : null;
}

export default async function EditInventoryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const item = await getInventoryItem(params.id);

  if (!item) {
    redirect('/inventories');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar ítem de inventario</h1>
          <p className="text-gray-600 mt-2">Modifica la información del material o equipo</p>
        </div>

        <InventoryItemForm initialData={item} />
      </div>
    </DashboardLayout>
  );
}
