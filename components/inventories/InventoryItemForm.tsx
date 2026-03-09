'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export type InventoryItemType = 'equipment_return' | 'equipment_stays' | 'project_material';

interface InventoryItemFormProps {
  initialData?: {
    _id?: string;
    name?: string;
    description?: string;
    type?: InventoryItemType;
    quantity?: number;
    unit?: string;
  };
}

const TYPE_OPTIONS: { value: InventoryItemType; label: string }[] = [
  { value: 'equipment_return', label: 'Equipo que va y regresa (martillo, escalera, etc.)' },
  { value: 'equipment_stays', label: 'Equipo que se queda en obra' },
  { value: 'project_material', label: 'Material para proyectos (consumible)' },
];

export default function InventoryItemForm({ initialData }: InventoryItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: (initialData?.type || 'equipment_return') as InventoryItemType,
    quantity: initialData?.quantity ?? 0,
    unit: initialData?.unit || 'pza',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = initialData?._id ? `/api/inventories/${initialData._id}` : '/api/inventories';
      const method = initialData?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar');
      }

      router.push('/inventories');
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

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            id="name"
            required
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Martillo, Escalera, Cable"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-gray-900 mb-2">
            Tipo *
          </label>
          <select
            id="type"
            required
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as InventoryItemType })}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="quantity" className="block text-sm font-semibold text-gray-900 mb-2">
              Cantidad en inventario *
            </label>
            <input
              type="number"
              id="quantity"
              min={0}
              required
              className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-semibold text-gray-900 mb-2">
              Unidad
            </label>
            <input
              type="text"
              id="unit"
              className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="pza, m, kg"
            />
          </div>
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
            placeholder="Descripción opcional..."
          />
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
            {loading ? 'Guardando...' : initialData?._id ? 'Actualizar' : 'Crear ítem'}
          </button>
        </div>
      </form>
    </div>
  );
}
