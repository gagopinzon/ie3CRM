'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

interface Contact {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
}

interface ClientFormProps {
  initialData?: {
    _id?: string;
    companyName?: string;
    rfc?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    contacts?: Contact[];
    notes?: string;
    status?: string;
  };
}

export default function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    rfc: initialData?.rfc || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    country: initialData?.country || 'México',
    contacts: initialData?.contacts && initialData.contacts.length > 0 
      ? initialData.contacts 
      : [{ name: '', email: '', phone: '', position: '' }],
    notes: initialData?.notes || '',
    status: initialData?.status || 'active',
  });

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { name: '', email: '', phone: '', position: '' }],
    });
  };

  const removeContact = (index: number) => {
    if (formData.contacts.length > 1) {
      setFormData({
        ...formData,
        contacts: formData.contacts.filter((_, i) => i !== index),
      });
    }
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updatedContacts = [...formData.contacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      contacts: updatedContacts,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = initialData?._id ? `/api/clients/${initialData._id}` : '/api/clients';
      const method = initialData?._id ? 'PUT' : 'POST';

      // Validar que al menos un contacto tenga nombre
      const validContacts = formData.contacts.filter((contact) => contact.name.trim() !== '');
      if (validContacts.length === 0) {
        setError('Debe agregar al menos un contacto con nombre');
        setLoading(false);
        return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          contacts: validContacts,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el cliente');
      }

      router.push('/clients');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-900 px-4 py-3 rounded font-medium">
            {error}
          </div>
        )}

        {/* Datos de la Empresa */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Datos de la Empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="companyName" className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                id="companyName"
                required
                className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="rfc" className="block text-sm font-semibold text-gray-900 mb-2">
                RFC
              </label>
              <input
                type="text"
                id="rfc"
                className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400 uppercase"
                value={formData.rfc}
                onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                placeholder="ABC123456789"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-gray-900 mb-2">
                País
              </label>
              <input
                type="text"
                id="country"
                className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                Dirección
              </label>
              <input
                type="text"
                id="address"
                className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                id="city"
                className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-gray-900 mb-2">
                Estado
              </label>
              <input
                type="text"
                id="state"
                className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-900 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                id="zipCode"
                className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Datos de Contacto */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Contactos</h2>
            <button
              type="button"
              onClick={addContact}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold text-sm"
            >
              <Plus size={18} />
              Agregar Contacto
            </button>
          </div>
          <div className="space-y-6">
            {formData.contacts.map((contact, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">Contacto {index + 1}</h3>
                  {formData.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="text-red-600 hover:text-red-900 font-semibold text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nombre del Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Cargo / Posición
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                      value={contact.position || ''}
                      onChange={(e) => updateContact(index, 'position', e.target.value)}
                      placeholder="Ej: Gerente de Proyectos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                      value={contact.phone || ''}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="+52 55 1234 5678"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
                      value={contact.email || ''}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Información Adicional */}
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
            Notas Adicionales
          </label>
          <textarea
            id="notes"
            rows={4}
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400 resize-none"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Información adicional sobre el cliente..."
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-2">
            Estado
          </label>
          <select
            id="status"
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            {loading ? 'Guardando...' : initialData?._id ? 'Actualizar Cliente' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
