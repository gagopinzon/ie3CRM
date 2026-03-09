import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InventoryItemForm from '@/components/inventories/InventoryItemForm';

export default async function NewInventoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo ítem de inventario</h1>
          <p className="text-gray-600 mt-2">Registra un material o equipo para asignar a proyectos</p>
        </div>

        <InventoryItemForm />
      </div>
    </DashboardLayout>
  );
}
