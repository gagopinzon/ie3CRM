'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/shared/types';

interface CategoryFormProps {
  initialData?: {
    _id?: string;
    name?: string;
    description?: string;
    canModify?: UserRole[];
    canView?: UserRole[];
  };
}

const roles: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'project_manager', label: 'Gerente de Proyecto' },
  { value: 'engineer', label: 'Ingeniero' },
  { value: 'viewer', label: 'Visualizador' },
];

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    canModify: initialData?.canModify || ['admin', 'project_manager'],
    canView: initialData?.canView || ['admin', 'project_manager', 'engineer', 'viewer'],
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = initialData?._id ? `/api/categories/${initialData._id}` : '/api/categories';
      const method = initialData?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar la categoría');
      }

      router.push('/categories');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: UserRole, type: 'canModify' | 'canView') => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].includes(role)
        ? prev[type].filter((r) => r !== role)
        : [...prev[type], role],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-900 px-4 py-3 rounded font-medium">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Nombre de la Categoría *
          </label>
          <input
            type="text"
            id="name"
            required
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Técnico, Comercial, Legal"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400 resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción de la categoría..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Roles que pueden modificar */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Roles que pueden Modificar *
            </label>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 space-y-2">
              {roles.map((role) => {
                const isSelected = formData.canModify.includes(role.value);
                return (
                  <label
                    key={role.value}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRole(role.value, 'canModify')}
                      className="w-4 h-4 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {role.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Roles que pueden ver */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Roles que pueden Ver *
            </label>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 space-y-2">
              {roles.map((role) => {
                const isSelected = formData.canView.includes(role.value);
                return (
                  <label
                    key={role.value}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-green-100 border-green-500'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRole(role.value, 'canView')}
                      className="w-4 h-4 rounded border-2 border-gray-400 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                    />
                    <span className={`text-sm font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                      {role.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
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
            {loading ? 'Guardando...' : initialData?._id ? 'Actualizar Categoría' : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
}
