'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit, Trash2, FileText, Clock, User } from 'lucide-react';

interface Note {
  _id: string;
  content: string;
  type: 'note' | 'log';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectNotesProps {
  projectId: string;
  initialNotes?: Note[];
}

export default function ProjectNotes({ projectId, initialNotes = [] }: ProjectNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [formContent, setFormContent] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'log'>('note');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formContent.trim()) {
      setError('El contenido de la nota es requerido');
      return;
    }

    setLoading(true);

    try {
      if (editingNote) {
        // Editar nota existente
        const response = await fetch(`/api/projects/${projectId}/notes/${editingNote}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: formContent }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al actualizar la nota');
        }

        const updatedNote = await response.json();
        setNotes(notes.map((note) => (note._id === editingNote ? updatedNote : note)));
        setEditingNote(null);
      } else {
        // Crear nueva nota
        const response = await fetch(`/api/projects/${projectId}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: formContent, type: noteType }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al crear la nota');
        }

        const newNote = await response.json();
        setNotes([newNote, ...notes]);
      }

      setFormContent('');
      setShowForm(false);
      setNoteType('note');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta nota?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter((note) => note._id !== noteId));
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar la nota');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error al eliminar la nota');
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note._id);
    setFormContent(note.content);
    setNoteType(note.type);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setFormContent('');
    setNoteType('note');
    setError('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const notesList = notes.filter((note) => note.type === 'note');
  const logsList = notes.filter((note) => note.type === 'log');

  return (
    <div className="space-y-6">
      {/* Bitácora */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock size={24} className="text-gray-700" />
            Bitácora
          </h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingNote(null);
              setNoteType('log');
              setFormContent('');
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold text-sm"
          >
            <Plus size={18} />
            Nueva Entrada
          </button>
        </div>

        {showForm && noteType === 'log' && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-900 px-4 py-3 rounded font-medium">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <textarea
                rows={4}
                className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400 resize-none"
                placeholder="Escribe una entrada en la bitácora..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                required
              />
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
                  {loading ? 'Guardando...' : editingNote ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        )}

        {logsList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <Clock size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No hay entradas en la bitácora aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logsList.map((log) => (
              <div key={log._id} className="border-l-4 border-gray-400 pl-4 py-3 bg-gray-50 rounded-r">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium whitespace-pre-wrap">{log.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {log.createdBy?.name || 'Usuario'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(log)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notas del Proyecto */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={24} className="text-gray-700" />
            Notas del Proyecto
          </h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingNote(null);
              setNoteType('note');
              setFormContent('');
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold text-sm"
          >
            <Plus size={18} />
            Nueva Nota
          </button>
        </div>

        {showForm && noteType === 'note' && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-900 px-4 py-3 rounded font-medium">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <textarea
                rows={4}
                className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400 resize-none"
                placeholder="Escribe una nota sobre el proyecto..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                required
              />
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
                  {loading ? 'Guardando...' : editingNote ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        )}

        {notesList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No hay notas aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notesList.map((note) => (
              <div key={note._id} className="border-l-4 border-black pl-4 py-3 bg-gray-50 rounded-r">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {note.createdBy?.name || 'Usuario'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
