'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2, Building2, User, Phone, Mail } from 'lucide-react';

interface Contact {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
}

interface Client {
  _id: string;
  companyName: string;
  rfc?: string;
  contacts: Contact[];
  status: string;
}

interface ClientsListProps {
  initialClients: Client[];
}

export default function ClientsList({ initialClients }: ClientsListProps) {
  const [clients, setClients] = useState<Client[]>(initialClients || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchClients();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar el cliente');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.rfc && client.rfc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && clients.length === 0) {
    return <div className="text-center py-8">Cargando clientes...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No hay clientes registrados</p>
        <Link
          href="/clients/new"
          className="mt-4 inline-block text-black hover:text-gray-700 font-semibold"
        >
          Crear tu primer cliente
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Buscar clientes..."
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-gray-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  RFC
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 size={20} className="text-gray-400 mr-2" />
                      <div className="text-sm font-semibold text-gray-900">{client.companyName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {client.rfc || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {client.contacts && client.contacts.length > 0 ? (
                        client.contacts.map((contact, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="flex items-center text-gray-900 font-medium">
                              <User size={14} className="text-gray-400 mr-2" />
                              {contact.name}
                              {contact.position && (
                                <span className="text-gray-500 ml-2">({contact.position})</span>
                              )}
                            </div>
                            <div className="ml-6 text-xs text-gray-600 space-x-3">
                              {contact.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {contact.phone}
                                </span>
                              )}
                              {contact.email && (
                                <span className="flex items-center gap-1">
                                  <Mail size={12} />
                                  {contact.email}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {client.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/clients/${client._id}`}
                        className="text-black hover:text-gray-700"
                        title="Ver"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/clients/${client._id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(client._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron clientes con "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
