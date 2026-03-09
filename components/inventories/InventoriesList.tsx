'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Package } from 'lucide-react';

export type InventoryItemType = 'equipment_return' | 'equipment_stays' | 'project_material';

interface InventoryItem {
  _id: string;
  name: string;
  description?: string;
  type: InventoryItemType;
  quantity: number;
  unit?: string;
}

interface InventoriesListProps {
  initialItems?: InventoryItem[];
}

const TYPE_LABELS: Record<InventoryItemType, string> = {
  equipment_return: 'Equipo que va y regresa',
  equipment_stays: 'Equipo que se queda en obra',
  project_material: 'Material para proyectos',
};

export default function InventoriesList({ initialItems = [] }: InventoriesListProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventories');
      if (response.ok) {
        const data = await response.json();
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching inventories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este ítem del inventario?')) return;

    try {
      const response = await fetch(`/api/inventories/${id}`, { method: 'DELETE' });

      if (response.ok) {
        fetchItems();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Error al eliminar');
    }
  };

  if (loading && items.length === 0) {
    return <div className="text-center py-8">Cargando inventarios...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Package size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No hay ítems en el inventario</p>
        <Link
          href="/inventories/new"
          className="mt-4 inline-block text-black hover:text-gray-700 font-semibold"
        >
          Crear tu primer ítem
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
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Package size={20} className="text-gray-400 mr-2" />
                    <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {TYPE_LABELS[item.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.quantity} {item.unit || 'pza'}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {item.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/inventories/${item._id}/edit`}
                      className="text-gray-600 hover:text-gray-900"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
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
