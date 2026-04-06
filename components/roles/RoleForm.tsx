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
    permissions: any;
    isSystem: boolean;
  };
}

const PERMISSIONS_CONFIG = [
  { key: 'canManageUsers', label: 'Gestionar Usuarios', description: 'Crear, editar y eliminar usuarios y roles' },
  { key: 'canManageProjects', label: 'Gestionar Proyectos', description: 'Crear, editar y eliminar proyectos' },
  { key: 'canManageClients', label: 'Gestionar Clientes', description: 'Crear, editar y eliminar clientes' },
  { key: 'canManageDocuments', label: 'Gestionar Documentos', description: 'Subir y eliminar documentos' },
  { key: 'canManageCategories', label: 'Gestionar Categorías', description: 'Crear y editar categorías de documentos' },
  { key: 'canManageDocumentTypes', label: 'Gestionar Tipos de Documentos', description: 'Crear y editar tipos de documentos' },
  { key: 'canManageInventory', label: 'Gestionar Inventarios', description: 'Crear y editar ítems del inventario de la compañía' },
  { key: 'canViewAllProjects', label: 'Ver Todos los Proyectos', description: 'Acceso a todos los proyectos del sistema independientemente del responsable' },
  { key: 'canEditAllProjects', label: 'Editar Todos los Proyectos', description: 'Modificar cualquier proyecto del sistema' },
] as const;

const DEFAULT_PERMISSIONS = {
  canManageUsers: false,
  canManageProjects: true,
  canManageClients: true,
  canManageDocuments: true,
  canManageCategories: false,
  canManageDocumentTypes: true,
  canManageInventory: true,
  canViewAllProjects: true,
  canEditAllProjects: false,
};

export default function RoleForm({ initialData }: RoleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    permissions: {
      ...DEFAULT_PERMISSIONS,
      ...(initialData?.permissions || {}),
    } as any,
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

  const togglePermission = (key: string) => {
    if (initialData?.code === 'admin') return;
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key],
      },
    });
  };

  const setAllPermissions = (value: boolean) => {
    if (initialData?.code === 'admin') return;
    const newPermissions = { ...formData.permissions };
    PERMISSIONS_CONFIG.forEach(config => {
      newPermissions[config.key] = value;
    });
    setFormData({ ...formData, permissions: newPermissions });
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Permisos</h3>
            {formData.code !== 'admin' && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAllPermissions(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider"
                >
                  Seleccionar Todos
                </button>
                <button
                  type="button"
                  onClick={() => setAllPermissions(false)}
                  className="text-xs text-red-600 hover:text-red-800 font-bold uppercase tracking-wider"
                >
                  Deseleccionar Todos
                </button>
              </div>
            )}
          </div>
          
          {formData.code === 'admin' ? (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-700">
                El rol de Administrador tiene todos los permisos habilitados por defecto y no pueden ser modificados para garantizar el acceso al sistema.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PERMISSIONS_CONFIG.map((config) => (
              <label 
                key={config.key} 
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  formData.permissions[config.key] 
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                    : 'border-gray-200 hover:bg-gray-50'
                } ${formData.code === 'admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  checked={formData.permissions[config.key] || false}
                  onChange={() => togglePermission(config.key)}
                  disabled={formData.code === 'admin'}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 cursor-pointer"
                />
                <div>
                  <div className={`font-bold ${formData.permissions[config.key] ? 'text-indigo-900' : 'text-gray-900'}`}>
                    {config.label}
                  </div>
                  <div className={`text-xs ${formData.permissions[config.key] ? 'text-indigo-700' : 'text-gray-600'}`}>
                    {config.description}
                  </div>
                </div>
              </label>
            ))}
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
