'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, GripVertical, User, Calendar } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import type { RefCallback } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { getStatusHexColor, getTaskCardPalette, KANBAN_COLUMN_THEME } from '@/lib/ui/workflowTheme';
import { localCalendarDayFromStored, storedDueDateToInputValue } from '@/lib/dateOnly';

type AssignedRef = string | { _id: string; name: string };

interface Task {
  _id: string;
  documentTypeId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  order: number;
  assignedTo?: AssignedRef | AssignedRef[];
  dueDate?: string | null;
  createdBy?: { name: string };
}

interface ProjectTasksKanbanProps {
  projectId: string;
  initialTasks?: Task[];
  readOnly?: boolean;
  users?: { _id: string; name: string }[];
}

const columns = [
  { id: 'todo', title: 'Por Hacer', color: KANBAN_COLUMN_THEME.todo },
  { id: 'in_progress', title: 'En Progreso', color: KANBAN_COLUMN_THEME.in_progress },
  { id: 'review', title: 'En Revisión', color: KANBAN_COLUMN_THEME.review },
  { id: 'done', title: 'Completado', color: KANBAN_COLUMN_THEME.done },
] as const;

function getAssignedIds(task: Task): string[] {
  const a = task.assignedTo;
  if (!a) return [];
  const arr = Array.isArray(a) ? a : [a];
  return arr
    .map((x) => (typeof x === 'object' && x?._id ? x._id : x))
    .filter((id): id is string => typeof id === 'string' && !!id);
}

function getAssignedNames(task: Task): string {
  const a = task.assignedTo;
  if (!a) return '';
  const arr = Array.isArray(a) ? a : [a];
  const names = arr.map((x) => (typeof x === 'object' && x?.name ? x.name : '')).filter(Boolean);
  return names.join(', ');
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onAssign,
  onChangeDueDate,
  readOnly,
  onMove,
  users = [],
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAssign: (taskId: string, userIds: string[]) => void;
  onChangeDueDate: (taskId: string, date: string | null) => void;
  readOnly?: boolean;
  onMove: (taskId: string, newStatus: Task['status']) => void;
  users?: { _id: string; name: string }[];
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task._id, status: task.status },
    canDrag: true,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const dragRef = drag as unknown as RefCallback<HTMLDivElement>;

  const assignedIds = getAssignedIds(task);
  const assignedNames = getAssignedNames(task);
  const palette = getTaskCardPalette(task.status);

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const userSelectRef = useRef<HTMLDivElement | null>(null);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()),
  );

  useEffect(() => {
    if (!userDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        userSelectRef.current &&
        !userSelectRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  return (
    <div
      ref={dragRef}
      className={`rounded-2xl p-4 mb-3 transition-all duration-200 border ${
        isDragging
          ? 'opacity-50 scale-[0.98]'
          : `${palette.card} shadow-[0_4px_20px_rgba(2,48,71,0.08)] hover:shadow-[0_8px_28px_rgba(2,48,71,0.12)]`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icono / handle tipo "Go International" */}
        <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm cursor-grab active:cursor-grabbing ${palette.handle}`}>
          <GripVertical size={18} className="text-[#023047]/70" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-bold text-gray-900 text-base leading-tight">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            {!readOnly && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(task)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(task._id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Asignar a varios usuarios (estilo caja con chips + dropdown) */}
          {!readOnly && users.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} className="text-gray-500" />
                </div>
                <div className="flex-1 relative" ref={userSelectRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserDropdownOpen((open) => !open);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-sm text-gray-700 flex flex-wrap items-center gap-2 text-left focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-shadow"
                  >
                    {assignedIds.length === 0 && (
                      <span className="text-gray-400">Seleccionar usuario(s)</span>
                    )}
                    {assignedIds.length > 0 &&
                      users
                        .filter((u) => assignedIds.includes(u._id))
                        .map((u) => (
                          <span
                            key={u._id}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-800 px-2.5 py-0.5 text-xs font-medium"
                          >
                            {u.name}
                          </span>
                        ))}
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Buscar..."
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 focus:ring-1 focus:ring-gray-900/10 focus:border-gray-400 outline-none"
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto py-1">
                        {filteredUsers.map((u) => {
                          const checked = assignedIds.includes(u._id);
                          return (
                            <label
                              key={u._id}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const next = checked
                                    ? assignedIds.filter((id) => id !== u._id)
                                    : [...assignedIds, u._id];
                                  onAssign(task._id, next);
                                }}
                                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900/20"
                              />
                              <span>{u.name}</span>
                            </label>
                          );
                        })}
                        {filteredUsers.length === 0 && (
                          <div className="px-3 py-2 text-xs text-gray-400">
                            Sin resultados
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-gray-500" />
                </div>
                <input
                  type="date"
                  value={task.dueDate ? storedDueDateToInputValue(task.dueDate) : ''}
                  onChange={(e) =>
                    onChangeDueDate(task._id, e.target.value || null)
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-shadow [color-scheme:light]"
                />
              </div>
            </div>
          )}

          {readOnly && (assignedNames || task.dueDate) && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
              {assignedNames && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <User size={14} className="text-gray-400 shrink-0" />
                  {assignedNames}
                </p>
              )}
              {task.dueDate && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  Compromiso:{' '}
                  {localCalendarDayFromStored(task.dueDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Column({
  column,
  tasks,
  onEdit,
  onDelete,
  onAssign,
  onChangeDueDate,
  readOnly,
  onMove,
  users = [],
}: {
  column: (typeof columns)[number];
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAssign: (taskId: string, userIds: string[]) => void;
  onChangeDueDate: (taskId: string, date: string | null) => void;
  readOnly?: boolean;
  onMove: (taskId: string, newStatus: Task['status']) => void;
  users?: { _id: string; name: string }[];
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

  const dropRef = drop as unknown as RefCallback<HTMLDivElement>;

  const hex = getStatusHexColor(column.id);
  const shellStyle: React.CSSProperties = {
    backgroundColor: `${hex}10`,
    borderColor: `${hex}33`,
    boxShadow: isOver ? `0 0 0 2px ${hex}55, 0 10px 25px -10px ${hex}55` : undefined,
  };
  const headerStyle: React.CSSProperties = {
    backgroundColor: `${hex}22`,
    borderBottomColor: `${hex}44`,
  };

  return (
    <div
      ref={dropRef}
      style={shellStyle}
      className="flex flex-col rounded-2xl border shadow-[0_2px_12px_rgba(2,48,71,0.08)] transition-shadow"
    >
      <div className={`${column.color} px-4 py-3.5 border-b`} style={headerStyle}>
        <h4 className="font-bold text-[#023047] text-sm">{column.title}</h4>
        <span className="text-xs text-[#023047]/80 mt-0.5 block">{tasks.length} tarea(s)</span>
      </div>
      <div className="p-3 min-h-[220px]">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onAssign={onAssign}
            onChangeDueDate={onChangeDueDate}
            readOnly={readOnly}
            onMove={onMove}
            users={users}
          />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-black/10 bg-white/40 text-center py-10 text-gray-500 text-sm">
            Sin tareas
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectTasksKanban({ projectId, initialTasks = [], readOnly = false, users = [] }: ProjectTasksKanbanProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    assignedTo: [] as string[],
    dueDate: '' as string,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!readOnly) {
      fetchTasks();
    }
  }, []);

  useEffect(() => {
    setTasks(initialTasks ?? []);
  }, [initialTasks]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

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

  const handleAssign = async (taskId: string, userIds: string[]) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const assigned = userIds.map((id) => ({
      _id: id,
      name: users.find((u) => u._id === id)?.name ?? '',
    }));
    setTasks(tasks.map((t) => (t._id === taskId ? { ...t, assignedTo: assigned } : t)));

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: userIds }),
      });
      if (!res.ok) {
        setTasks(tasks);
        const data = await res.json();
        setToast({ type: 'error', message: data.error || 'No se pudo asignar responsables.' });
      } else {
        const updated = await res.json();
        setTasks(tasks.map((t) => (t._id === taskId ? updated : t)));
        setToast({ type: 'success', message: 'Responsables actualizados correctamente.' });
      }
    } catch {
      setTasks(tasks);
      setToast({ type: 'error', message: 'Error de conexión al asignar responsables.' });
    }
  };

  const handleDueDateChange = async (taskId: string, date: string | null) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const prev = task.dueDate ? storedDueDateToInputValue(task.dueDate) : '';
    if (prev === (date || '')) return;

    setTasks(
      tasks.map((t) =>
        t._id === taskId ? { ...t, dueDate: date || null } : t
      )
    );

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: date || null }),
      });
      if (!res.ok) {
        setTasks(tasks);
        const data = await res.json();
        setToast({ type: 'error', message: data.error || 'No se pudo actualizar la fecha de compromiso.' });
      } else {
        const updated = await res.json();
        setTasks(tasks.map((t) => (t._id === taskId ? updated : t)));
        setToast({ type: 'success', message: 'Fecha de compromiso actualizada.' });
      }
    } catch {
      setTasks(tasks);
      setToast({ type: 'error', message: 'Error de conexión al actualizar la fecha de compromiso.' });
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
        setToast({ type: 'error', message: data.error || 'No se pudo mover el paso.' });
      } else {
        // Refresh to get updated progress
        if (readOnly) {
          window.location.reload();
        } else {
          fetchTasks();
          setToast({ type: 'success', message: 'Paso movido correctamente.' });
        }
      }
    } catch (error) {
      setTasks(tasks);
      setToast({ type: 'error', message: 'Error de conexión al mover el paso.' });
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
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            assignedTo: formData.assignedTo,
            dueDate: formData.dueDate || null,
          }),
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
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            assignedTo: formData.assignedTo,
            dueDate: formData.dueDate || null,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al crear la tarea');
        }

        const newTask = await response.json();
        setTasks([...tasks, newTask]);
      }

      setFormData({ title: '', description: '', status: 'todo', assignedTo: [], dueDate: '' });
      setShowForm(false);
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
      setToast({ type: 'error', message: err.message || 'Error al guardar el paso.' });
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
        setToast({ type: 'error', message: data.error || 'No se pudo eliminar el paso.' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error de conexión al eliminar el paso.' });
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    const due = task.dueDate ? storedDueDateToInputValue(task.dueDate) : '';
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      assignedTo: getAssignedIds(task),
      dueDate: due,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 'todo', assignedTo: [], dueDate: '' });
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900">Pasos del Proyecto</h3>
              <p className="text-sm text-gray-500 mt-0.5">Define los pasos necesarios para completar el proyecto</p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingTask(null);
                setFormData({ title: '', description: '', status: 'todo', assignedTo: [], dueDate: '' });
              }}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-black transition-all sm:w-auto"
            >
              <Plus size={18} />
              Agregar Tarea
            </button>
          </div>
        )}

        {showForm && !readOnly && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          >
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-900 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Título del Paso *
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-shadow"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Revisión inicial, Diseño, Aprobación"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none resize-none transition-shadow"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del paso..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Estado Inicial
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-shadow"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                >
                  <option value="todo">Por Hacer</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="review">En Revisión</option>
                  <option value="done">Completado</option>
                </select>
              </div>
              {users.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Asignar a (varios)
                </label>
                <select
                  multiple
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-shadow min-h-[2.75rem]"
                  value={formData.assignedTo}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (opt) => opt.value,
                    );
                    setFormData({ ...formData, assignedTo: selected });
                  }}
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Fecha de compromiso
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-shadow [color-scheme:light]"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Opcional. Cuándo debe estar listo este paso.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                >
                  {loading ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear Paso'}
                </button>
              </div>
            </div>
          </form>
        )}

        {readOnly && tasks.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-600">Progreso calculado</span>
              <span className="text-xl font-bold text-gray-900">{calculateProgress()}%</span>
            </div>
          </div>
        )}

        {/* Móvil/tablet: scroll horizontal; desde lg 2 columnas; desde xl 4 (mejor en HD 1366 con sidebar) */}
        <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-2 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] lg:snap-none lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-4">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id as Task['status']);
            return (
              <div
                key={column.id}
                className="w-[min(85vw,300px)] shrink-0 snap-center sm:w-[280px] lg:w-auto lg:min-w-0 lg:shrink"
              >
                <Column
                  column={column}
                  tasks={columnTasks}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                  onAssign={handleAssign}
                  onChangeDueDate={handleDueDateChange}
                  readOnly={readOnly}
                  onMove={handleMove}
                  users={users}
                />
              </div>
            );
          })}
        </div>
      </div>
      {toast && (
        <div
          role="status"
          className={`fixed z-50 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold left-4 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md ${
            toast.type === 'success'
              ? 'bg-emerald-500 border-emerald-600 text-white'
              : 'bg-red-500 border-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </DndProvider>
  );
}
