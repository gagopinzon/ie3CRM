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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 max-w-xl">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-900 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            id="name"
            required
            className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:ring-2 focus:ring-black"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Juan Pérez"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            id="email"
            required
            className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:ring-2 focus:ring-black disabled:bg-gray-100"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="correo@ejemplo.com"
            disabled={!!initialData}
          />
          {initialData && <p className="mt-0.5 text-xs text-gray-500">No editable</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {initialData ? 'Nueva contraseña' : 'Contraseña *'}
          </label>
          <input
            type="password"
            id="password"
            required={!initialData}
            className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:ring-2 focus:ring-black"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Mín. 6 caracteres"
          />
        </div>
        <div>
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
          <select
            id="roleId"
            required
            className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:ring-2 focus:ring-black"
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>{role.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Link
          href="/users"
          className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium text-sm hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear usuario'}
        </button>
      </div>
    </form>
  );
}
