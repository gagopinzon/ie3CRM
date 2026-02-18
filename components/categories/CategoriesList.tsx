'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Folder, Users, Eye } from 'lucide-react';
import { UserRole } from '@/shared/types';

interface Category {
  _id: string;
  name: string;
  description?: string;
  canModify: UserRole[];
  canView: UserRole[];
}

interface CategoriesListProps {
  initialCategories: Category[];
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  project_manager: 'Gerente de Proyecto',
  engineer: 'Ingeniero',
  viewer: 'Visualizador',
};

export default function CategoriesList({ initialCategories }: CategoriesListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  if (loading && categories.length === 0) {
    return <div className="text-center py-8">Cargando categorías...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Folder size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No hay categorías registradas</p>
        <Link
          href="/categories/new"
          className="mt-4 inline-block text-black hover:text-gray-700 font-semibold"
        >
          Crear tu primera categoría
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Pueden Modificar
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Pueden Ver
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Folder size={20} className="text-gray-400 mr-2" />
                    <div className="text-sm font-semibold text-gray-900">{category.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 max-w-xs truncate">
                    {category.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {category.canModify && category.canModify.length > 0 ? (
                      category.canModify.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                          {roleLabels[role]}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {category.canView && category.canView.length > 0 ? (
                      category.canView.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded"
                        >
                          {roleLabels[role]}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/categories/${category._id}/edit`}
                      className="text-gray-600 hover:text-gray-900"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(category._id)}
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
    </div>
  );
}
