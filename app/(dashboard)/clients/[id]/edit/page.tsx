import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import ClientForm from '@/components/clients/ClientForm';

async function getClientData(id: string) {
  await connectDB();
  const client = await Client.findById(id);
  return client ? JSON.parse(JSON.stringify(client)) : null;
}

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const client = await getClientData(params.id);

  if (!client) {
    redirect('/clients');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-gray-600 mt-2">Modifica la información del cliente</p>
        </div>

        <ClientForm initialData={client} />
      </div>
    </DashboardLayout>
  );
}
