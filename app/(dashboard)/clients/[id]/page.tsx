import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import Link from 'next/link';
import { ArrowLeft, Edit, Building2, User, Phone, Mail, MapPin, FileText } from 'lucide-react';

async function getClient(id: string) {
  await connectDB();
  const client = await Client.findById(id);
  return client ? JSON.parse(JSON.stringify(client)) : null;
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const client = await getClient(params.id);

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Cliente no encontrado</p>
          <Link href="/clients" className="text-black hover:text-gray-700 mt-4 inline-block font-semibold">
            Volver a clientes
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/clients" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.companyName}</h1>
              <p className="text-gray-600 mt-1">
                {client.status === 'active' ? 'Cliente Activo' : 'Cliente Inactivo'}
              </p>
            </div>
          </div>
          <Link
            href={`/clients/${params.id}/edit`}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
          >
            <Edit size={20} />
            Editar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos de la Empresa */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={24} className="text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Datos de la Empresa</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-500">Nombre de la Empresa</label>
                <p className="text-gray-900 font-medium">{client.companyName}</p>
              </div>
              {client.rfc && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">RFC</label>
                  <p className="text-gray-900 font-medium">{client.rfc}</p>
                </div>
              )}
              {client.address && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">Dirección</label>
                  <p className="text-gray-900 font-medium">{client.address}</p>
                </div>
              )}
              {(client.city || client.state || client.zipCode) && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">Ubicación</label>
                  <p className="text-gray-900 font-medium">
                    {[client.city, client.state, client.zipCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {client.country && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">País</label>
                  <p className="text-gray-900 font-medium">{client.country}</p>
                </div>
              )}
            </div>
          </div>

          {/* Datos de Contacto */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={24} className="text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Contactos</h2>
            </div>
            <div className="space-y-6">
              {client.contacts && client.contacts.length > 0 ? (
                client.contacts.map((contact: any, index: number) => (
                  <div key={index} className="border-l-4 border-gray-300 pl-4">
                    <div className="mb-2">
                      <label className="text-sm font-semibold text-gray-500">Contacto {index + 1}</label>
                      <p className="text-gray-900 font-bold text-lg">{contact.name}</p>
                    </div>
                    {contact.position && (
                      <div className="mb-2">
                        <label className="text-sm font-semibold text-gray-500">Cargo / Posición</label>
                        <p className="text-gray-900 font-medium">{contact.position}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contact.phone && (
                        <div>
                          <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                            <Phone size={16} />
                            Teléfono
                          </label>
                          <p className="text-gray-900 font-medium">{contact.phone}</p>
                        </div>
                      )}
                      {contact.email && (
                        <div>
                          <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                            <Mail size={16} />
                            Email
                          </label>
                          <p className="text-gray-900 font-medium">{contact.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay contactos registrados</p>
              )}
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={24} className="text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Notas</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
