'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Role {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

interface UserFormProps {
  roles: Role[];
  initialData?: {
    _id: string;
    email: string;
    name: string;
    role: string | Role;
  };
}

export default function UserForm({ roles, initialData }: UserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    name: initialData?.name || '',
    password: '',
    roleId: initialData
      ? typeof initialData.role === 'object'
        ? initialData.role._id
        : initialData.role
      : roles.length > 0
      ? roles[0]._id
      : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.name || !formData.roleId) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (!initialData && !formData.password) {
      setError('La contraseña es requerida para nuevos usuarios');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const url = initialData ? `/api/users/${initialData._id}` : '/api/users';
      const method = initialData ? 'PUT' : 'POST';

      const body: any = {
        email: formData.email,
        name: formData.name,
        roleId: formData.roleId,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el usuario');
      }

      router.push('/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-900 px-4 py-3 rounded font-medium">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="name"
            required
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            required
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ejemplo@correo.com"
            disabled={!!initialData}
          />
          {initialData && (
            <p className="mt-1 text-xs text-gray-500">El email no se puede modificar</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
            {initialData ? 'Nueva Contraseña (dejar vacío para mantener la actual)' : 'Contraseña *'}
          </label>
          <input
            type="password"
            id="password"
            required={!initialData}
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label htmlFor="roleId" className="block text-sm font-semibold text-gray-900 mb-2">
            Rol *
          </label>
          <select
            id="roleId"
            required
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          >
            <option value="">Selecciona un rol</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name} {role.description ? `- ${role.description}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <Link
            href="/users"
            className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Guardando...' : initialData ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </div>
    </form>
  );
}
