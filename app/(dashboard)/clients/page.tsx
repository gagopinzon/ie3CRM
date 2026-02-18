import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ClientsList from '@/components/clients/ClientsList';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

async function getClients() {
  try {
    await connectDB();
    const clients = await Client.find().sort({ companyName: 1 });
    return JSON.parse(JSON.stringify(clients));
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const clients = await getClients();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-2">Gestiona tus clientes</p>
          </div>
          <Link
            href="/clients/new"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
          >
            <Plus size={20} />
            Nuevo Cliente
          </Link>
        </div>

        <ClientsList initialClients={clients} />
      </div>
    </DashboardLayout>
  );
}
