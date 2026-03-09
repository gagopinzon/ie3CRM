'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Package, Plus, Edit, Trash2, X, Calendar, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryItem {
  _id: string;
  name: string;
  type: string;
  quantity: number;
  unit?: string;
}

interface Assignment {
  _id: string;
  inventoryItemId: string;
  inventoryItem: InventoryItem | null;
  startDate: string;
  endDate: string;
  quantity: number;
  notes?: string;
}

interface ProjectInventorySectionProps {
  projectId: string;
  readOnly?: boolean;
  initialAssignments?: Assignment[];
}

const TYPE_LABELS: Record<string, string> = {
  equipment_return: 'Va y regresa',
  equipment_stays: 'Se queda en obra',
  project_material: 'Material',
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProjectInventorySection({
  projectId,
  readOnly = false,
  initialAssignments = [],
}: ProjectInventorySectionProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalSelected, setModalSelected] = useState<Record<string, number>>({});
  const [modalDates, setModalDates] = useState({ startDate: '', endDate: '' });
  const [editFormData, setEditFormData] = useState({
    startDate: '',
    endDate: '',
    quantity: 1,
  });

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/inventory`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data || []);
      }
    } catch (e) {
      console.error('Error fetching inventory assignments:', e);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const res = await fetch('/api/inventories');
      if (res.ok) {
        const data = await res.json();
        setInventoryItems(data || []);
      }
    } catch (e) {
      console.error('Error fetching inventory items:', e);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [projectId]);

  useEffect(() => {
    if (!readOnly && (showModal || editingId)) {
      fetchInventoryItems();
    }
  }, [readOnly, showModal, editingId]);

  const openModal = () => {
    setShowModal(true);
    setModalSelected({});
    setModalDates({ startDate: '', endDate: '' });
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setModalSelected({});
    setModalDates({ startDate: '', endDate: '' });
    setError('');
  };

  const toggleItem = (id: string, qty: number = 1) => {
    setModalSelected((prev) => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        delete next[id];
      } else {
        next[id] = Math.max(1, qty);
      }
      return next;
    });
  };

  const setItemQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setModalSelected((prev) => ({ ...prev, [id]: qty }));
  };

  const startEdit = (a: Assignment) => {
    setEditingId(a._id);
    setEditFormData({
      startDate: a.startDate ? a.startDate.slice(0, 10) : '',
      endDate: a.endDate ? a.endDate.slice(0, 10) : '',
      quantity: a.quantity,
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({ startDate: '', endDate: '', quantity: 1 });
    setError('');
  };

  const handleBatchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const selectedIds = Object.keys(modalSelected);
    if (selectedIds.length === 0) {
      setError('Selecciona al menos un material');
      return;
    }
    if (!modalDates.startDate || !modalDates.endDate) {
      setError('Indica las fechas de inicio y fin');
      return;
    }
    setLoading(true);
    try {
      for (const itemId of selectedIds) {
        const qty = modalSelected[itemId] || 1;
        const res = await fetch(`/api/projects/${projectId}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inventoryItemId: itemId,
            startDate: modalDates.startDate,
            endDate: modalDates.endDate,
            quantity: qty,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al agregar');
        }
      }
      closeModal();
      fetchAssignments();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId || !editFormData.startDate || !editFormData.endDate || editFormData.quantity < 1) {
      setError('Completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/inventory/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar');
      }
      cancelEdit();
      fetchAssignments();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta asignación?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAssignments();
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Package size={24} className="text-gray-700" />
        Materiales por fecha
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {readOnly
          ? 'Materiales y equipos asignados al proyecto con sus fechas de uso'
          : 'Asigna materiales y equipos indicando los días que se necesitarán'}
      </p>

      {!readOnly && (
        <div className="mb-4">
          <button
            type="button"
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 font-semibold"
          >
            <Plus size={18} />
            Agregar material
          </button>
        </div>
      )}

      {/* Modal: selección múltiple de materiales */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget && !loading) closeModal(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 id="modal-title" className="text-xl font-bold text-gray-900">
                Agregar materiales al proyecto
              </h3>
              <button
                type="button"
                onClick={() => !loading && closeModal()}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleBatchSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="px-6 py-4 overflow-y-auto flex-1">
                {error && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-900 px-3 py-2 text-sm rounded">
                    {error}
                  </div>
                )}
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona los materiales que llevarás y luego indica las fechas para todos.
                </p>
                {inventoryItems.length === 0 ? (
                  <p className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded">
                    No hay ítems en el inventario. Crea primero ítems en{' '}
                    <a href="/inventories" className="font-semibold underline text-amber-900">Inventarios</a>.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {inventoryItems.map((item) => {
                      const isSelected = modalSelected[item._id] !== undefined;
                      const qty = modalSelected[item._id] ?? 1;
                      return (
                        <label
                          key={item._id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isSelected}
                            onChange={() => toggleItem(item._id)}
                          />
                          <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 block truncate">{item.name}</span>
                            <span className="text-xs text-gray-500">{TYPE_LABELS[item.type] || item.type}</span>
                          </div>
                          {isSelected && (
                            <input
                              type="number"
                              min={1}
                              className="w-16 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 font-medium bg-white"
                              value={qty}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setItemQty(item._id, Number(e.target.value) || 1)}
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
                {inventoryItems.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Fecha inicio *</label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 font-medium"
                        value={modalDates.startDate}
                        onChange={(e) => setModalDates((d) => ({ ...d, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Fecha fin *</label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 font-medium"
                        value={modalDates.endDate}
                        onChange={(e) => setModalDates((d) => ({ ...d, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || inventoryItems.length === 0 || Object.keys(modalSelected).length === 0}
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50"
                >
                  {loading ? 'Agregando...' : `Agregar ${Object.keys(modalSelected).length} material(es)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulario inline para editar una asignación */}
      {editingId && (
        <form onSubmit={handleEditSubmit} className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-900 px-3 py-2 text-sm rounded">{error}</div>
          )}
          <p className="text-sm font-semibold text-gray-900">Editar fechas y cantidad</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Fecha inicio *</label>
              <input
                type="date"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 font-medium"
                value={editFormData.startDate}
                onChange={(e) => setEditFormData((d) => ({ ...d, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Fecha fin *</label>
              <input
                type="date"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 font-medium"
                value={editFormData.endDate}
                onChange={(e) => setEditFormData((d) => ({ ...d, endDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Cantidad *</label>
              <input
                type="number"
                min={1}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 font-medium"
                value={editFormData.quantity}
                onChange={(e) => setEditFormData((d) => ({ ...d, quantity: Number(e.target.value) || 1 }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Actualizar'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {sortedAssignments.length === 0 ? (
        <p className="text-gray-500 py-6 text-center">
          {readOnly ? 'No hay materiales asignados' : 'Aún no hay materiales asignados. Agrega el primero.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-2 font-semibold text-gray-900 text-sm">Material</th>
                <th className="py-2 px-2 font-semibold text-gray-900 text-sm">Cantidad</th>
                <th className="py-2 px-2 font-semibold text-gray-900 text-sm">Desde</th>
                <th className="py-2 px-2 font-semibold text-gray-900 text-sm">Hasta</th>
                {!readOnly && (
                  <th className="py-2 px-2 font-semibold text-gray-900 text-sm text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedAssignments.map((a) => (
                <tr key={a._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-900">
                      {a.inventoryItem?.name || '—'}
                    </div>
                    {a.inventoryItem?.type && (
                      <span className="text-xs text-gray-500">
                        {TYPE_LABELS[a.inventoryItem.type] || a.inventoryItem.type}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-gray-700">
                    {a.quantity} {a.inventoryItem?.unit || 'pza'}
                  </td>
                  <td className="py-3 px-2 text-gray-700 flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(a.startDate)}
                  </td>
                  <td className="py-3 px-2 text-gray-700 flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(a.endDate)}
                  </td>
                  {!readOnly && (
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(a)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
