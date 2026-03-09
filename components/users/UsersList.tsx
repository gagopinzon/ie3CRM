'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Search, User } from 'lucide-react';

interface UserRole {
  _id: string;
  name: string;
  code: string;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: UserRole | string;
  createdAt?: string;
}

interface UsersListProps {
  initialUsers: UserItem[];
  currentUserId?: string;
}

export default function UsersList({ initialUsers, currentUserId }: UsersListProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`¿Eliminar al usuario "${userName}"?`)) return;

    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });

      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userId));
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  };

  const roleName = (u: UserItem) =>
    typeof u.role === 'object' && u.role !== null ? (u.role as UserRole).name : '—';

  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      roleName(u).toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black text-gray-900 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Rol</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-500 text-sm">
                  {searchTerm ? 'No hay coincidencias' : 'No hay usuarios'}
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{roleName(u)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/users/${u._id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Link>
                      {currentUserId !== u._id && (
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
