'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RoleFormProps {
  initialData?: {
    _id: string;
    name: string;
    code: string;
    description?: string;
    permissions: {
      canManageUsers: boolean;
      canManageProjects: boolean;
      canManageClients: boolean;
      canManageDocuments: boolean;
      canManageCategories: boolean;
      canManageDocumentTypes: boolean;
      canViewAllProjects: boolean;
      canEditAllProjects: boolean;
    };
    isSystem: boolean;
  };
}

export default function RoleForm({ initialData }: RoleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    permissions: initialData?.permissions || {
      canManageUsers: false,
      canManageProjects: true,
      canManageClients: true,
      canManageDocuments: true,
      canManageCategories: false,
      canManageDocumentTypes: true,
      canViewAllProjects: true,
      canEditAllProjects: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.code) {
      setError('Nombre y código son requeridos');
      return;
    }

    if (!/^[a-z_]+$/.test(formData.code)) {
      setError('El código solo puede contener letras minúsculas y guiones bajos');
      return;
    }

    setLoading(true);

    try {
      const url = initialData ? `/api/roles/${initialData._id}` : '/api/roles';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el rol');
      }

      router.push('/roles');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (key: keyof typeof formData.permissions) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key],
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-900 px-4 py-3 rounded font-medium">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Nombre del Rol *
            </label>
            <input
              type="text"
              id="name"
              required
              className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Administrador"
              disabled={initialData?.isSystem}
            />
            {initialData?.isSystem && (
              <p className="mt-1 text-xs text-gray-500">No se puede modificar el nombre de un rol del sistema</p>
            )}
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-gray-900 mb-2">
              Código del Rol *
            </label>
            <input
              type="text"
              id="code"
              required
              className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium font-mono"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z_]/g, '') })}
              placeholder="admin, project_manager, etc."
              disabled={!!initialData}
            />
            {initialData && (
              <p className="mt-1 text-xs text-gray-500">El código no se puede modificar</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Solo letras minúsculas y guiones bajos</p>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del rol y sus responsabilidades..."
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Permisos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.permissions.canManageUsers}
                onChange={() => togglePermission('canManageUsers')}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <div>
                <div className="font-semibold text-gray-900">Gestionar Usuarios</div>
                <div className="text-xs text-gray-600">Crear, editar y eliminar usuarios</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.permissions.canManageProjects}
                onChange={() => togglePermission('canManageProjects')}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <div>
                <div className="font-semibold text-gray-900">Gestionar Proyectos</div>
                <div className="text-xs text-gray-600">Crear, editar y eliminar proyectos</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.permissions.canManageClients}
                onChange={() => togglePermission('canManageClients')}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <div>
                <div className="font-semibold text-gray-900">Gestionar Clientes</div>
                <div className="text-xs text-gray-600">Crear, editar y eliminar clientes</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.permissions.canManageDocuments}
                onChange={() => togglePermission('canManageDocuments')}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <div>
                <div className="font-semibold text-gray-900">Gestionar Documentos</div>
                <div className="text-xs text-gray-600">Subir y eliminar documentos</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.permissions.canManageCategories}
                onChange={() => togglePermission('canManageCategories')}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <div>
                <div className="font-semibold text-gray-900">Gestionar Categorías</div>
                <div className="text-xs text-gray-600">Crear y editar categorías de documentos</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.permissions.canManageDocumentTypes}
                onChange={() => togglePermission('canManageDocumentTypes')}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <div>
                <div className="font-semibold text-gray-900">Gestionar Tipos de Documentos</div>
                <div className="text-xs text-gray-600">Crear y editar tipos de documentos</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.permissions.canViewAllProjects}
                onChange={() => togglePermission('canViewAllProjects')}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <div>
                <div className="font-semibold text-gray-900">Ver Todos los Proyectos</div>
                <div className="text-xs text-gray-600">Acceso a todos los proyectos del sistema</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.permissions.canEditAllProjects}
                onChange={() => togglePermission('canEditAllProjects')}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <div>
                <div className="font-semibold text-gray-900">Editar Todos los Proyectos</div>
                <div className="text-xs text-gray-600">Modificar cualquier proyecto</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <Link
            href="/roles"
            className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Guardando...' : initialData ? 'Actualizar Rol' : 'Crear Rol'}
          </button>
        </div>
      </div>
    </form>
  );
}
