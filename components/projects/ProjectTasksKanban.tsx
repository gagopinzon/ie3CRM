'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  order: number;
  createdBy?: {
    name: string;
  };
}

interface ProjectTasksKanbanProps {
  projectId: string;
  initialTasks?: Task[];
  readOnly?: boolean;
}

const columns = [
  { id: 'todo', title: 'Por Hacer', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'En Progreso', color: 'bg-blue-100' },
  { id: 'review', title: 'En Revisión', color: 'bg-yellow-100' },
  { id: 'done', title: 'Completado', color: 'bg-green-100' },
] as const;

function TaskCard({ task, onEdit, onDelete, readOnly, onMove }: { 
  task: Task; 
  onEdit: (task: Task) => void; 
  onDelete: (id: string) => void; 
  readOnly?: boolean;
  onMove: (taskId: string, newStatus: Task['status']) => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task._id, status: task.status },
    canDrag: true, // Permitir arrastrar siempre para mover entre columnas
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg shadow p-3 mb-2 border-2 border-gray-200 hover:border-gray-400 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <GripVertical size={16} className="text-gray-400 cursor-grab active:cursor-grabbing" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
          </div>
        </div>
        {!readOnly && (
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => onEdit(task)}
              className="text-gray-600 hover:text-gray-900"
              title="Editar"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="text-red-600 hover:text-red-900"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Column({ 
  column, 
  tasks, 
  onEdit, 
  onDelete, 
  readOnly, 
  onMove 
}: { 
  column: typeof columns[number]; 
  tasks: Task[]; 
  onEdit: (task: Task) => void; 
  onDelete: (id: string) => void; 
  readOnly?: boolean;
  onMove: (taskId: string, newStatus: Task['status']) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string; status: Task['status'] }) => {
      if (item.status !== column.id) {
        onMove(item.id, column.id as Task['status']);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className="flex flex-col">
      <div className={`${column.color} rounded-t-lg p-3 border-b-2 border-gray-300 ${isOver ? 'ring-2 ring-black' : ''}`}>
        <h4 className="font-bold text-gray-900 text-sm">{column.title}</h4>
        <span className="text-xs text-gray-600">{tasks.length} tarea(s)</span>
      </div>
      <div className="bg-gray-50 rounded-b-lg p-3 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            readOnly={readOnly}
            onMove={onMove}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Sin tareas
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectTasksKanban({ projectId, initialTasks = [], readOnly = false }: ProjectTasksKanbanProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'todo' as Task['status'] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!readOnly) {
      fetchTasks();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleMove = async (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        // Revert on error
        setTasks(tasks);
        const data = await response.json();
        alert(data.error || 'Error al mover la tarea');
      } else {
        // Refresh to get updated progress
        if (readOnly) {
          window.location.reload();
        } else {
          fetchTasks();
        }
      }
    } catch (error) {
      setTasks(tasks);
      alert('Error al mover la tarea');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    setLoading(true);

    try {
      if (editingTask) {
        const response = await fetch(`/api/projects/${projectId}/tasks/${editingTask._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al actualizar la tarea');
        }

        const updatedTask = await response.json();
        setTasks(tasks.map((t) => (t._id === editingTask._id ? updatedTask : t)));
        setEditingTask(null);
      } else {
        const response = await fetch(`/api/projects/${projectId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al crear la tarea');
        }

        const newTask = await response.json();
        setTasks([...tasks, newTask]);
      }

      setFormData({ title: '', description: '', status: 'todo' });
      setShowForm(false);
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter((t) => t._id !== taskId));
        fetchTasks();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar la tarea');
      }
    } catch (error) {
      alert('Error al eliminar la tarea');
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 'todo' });
    setError('');
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((task) => task.status === status).sort((a, b) => a.order - b.order);
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const doneTasks = tasks.filter((t) => t.status === 'done').length;
    return Math.round((doneTasks / tasks.length) * 100);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {!readOnly && (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pasos del Proyecto</h3>
              <p className="text-sm text-gray-600">Define los pasos necesarios para completar el proyecto</p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingTask(null);
                setFormData({ title: '', description: '', status: 'todo' });
              }}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold text-sm"
            >
              <Plus size={18} />
              Agregar Paso
            </button>
          </div>
        )}

        {showForm && !readOnly && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-900 px-4 py-3 rounded font-medium">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Título del Paso *
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Revisión inicial, Diseño, Aprobación"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del paso..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Estado Inicial
                </label>
                <select
                  className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                >
                  <option value="todo">Por Hacer</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="review">En Revisión</option>
                  <option value="done">Completado</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear Paso'}
                </button>
              </div>
            </div>
          </form>
        )}

        {readOnly && tasks.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Progreso Calculado</span>
              <span className="text-lg font-bold text-gray-900">{calculateProgress()}%</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id as Task['status']);
            return (
              <Column
                key={column.id}
                column={column}
                tasks={columnTasks}
                onEdit={startEdit}
                onDelete={handleDelete}
                readOnly={readOnly}
                onMove={handleMove}
              />
            );
          })}
        </div>
      </div>
    </DndProvider>
  );
}
