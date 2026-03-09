'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { DocumentType } from '@/shared/types';

interface ProjectFormProps {
  documentTypes: DocumentType[];
  clients?: { _id: string; companyName: string }[];
  initialData?: {
    _id?: string;
    name?: string;
    description?: string;
    client?: string;
    documentTypes?: string[];
    kanbanColumn?: string;
  };
}

export default function ProjectForm({ documentTypes, clients, initialData }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  /** Lista de tipos (se amplía al dar de alta uno nuevo en caliente) */
  const [documentTypesList, setDocumentTypesList] = useState<DocumentType[]>(documentTypes);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    client: initialData?.client || '',
    documentTypes: initialData?.documentTypes || [],
    kanbanColumn: initialData?.kanbanColumn || 'Contacted',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = initialData?._id ? `/api/projects/${initialData._id}` : '/api/projects';
      const method = initialData?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el proyecto');
      }

      router.push('/projects');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDocumentType = (docTypeId: string) => {
    setFormData((prev) => ({
      ...prev,
      documentTypes: prev.documentTypes.includes(docTypeId)
        ? prev.documentTypes.filter((id) => id !== docTypeId)
        : [...prev.documentTypes, docTypeId],
    }));
  };

  /** Dar de alta un nuevo tipo de documento en caliente */
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [creatingType, setCreatingType] = useState(false);
  const [createTypeError, setCreateTypeError] = useState('');

  const createAndAddDocumentType = async () => {
    const name = newTypeName.trim();
    if (!name) {
      setCreateTypeError('Escribe el nombre del tipo');
      return;
    }
    if (documentTypesList.some((dt) => dt.name.toLowerCase() === name.toLowerCase())) {
      setCreateTypeError('Ya existe un tipo con ese nombre');
      return;
    }
    setCreateTypeError('');
    setCreatingType(true);
    try {
      const res = await fetch('/api/document-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: newTypeDescription.trim() || undefined,
          allowedFileTypes: ['documento'],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear el tipo');
      }
      const created = await res.json();
      setDocumentTypesList((prev) => [...prev, created]);
      setFormData((prev) => ({
        ...prev,
        documentTypes: [...prev.documentTypes, created._id],
      }));
      setNewTypeName('');
      setNewTypeDescription('');
    } catch (err: any) {
      setCreateTypeError(err.message);
    } finally {
      setCreatingType(false);
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
            Nombre del Proyecto *
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Descripción *
          </label>
          <textarea
            id="description"
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400 resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="client" className="block text-sm font-semibold text-gray-900 mb-2">
            Cliente *
          </label>
          <input
            type="text"
            id="client"
            required
            className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Tipos de Documentos
          </label>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-sm font-semibold text-gray-700 mb-2">Dar de alta un tipo nuevo</p>
            <p className="text-xs text-gray-600 mb-3">Si el tipo que necesitas no está en la lista, créalo aquí y se asignará al proyecto.</p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[160px]">
                <label htmlFor="new-type-name" className="sr-only">Nombre del tipo</label>
                <input
                  id="new-type-name"
                  type="text"
                  placeholder="Ej: Pez globo, Permiso municipal..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onFocus={() => setCreateTypeError('')}
                  className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black focus:ring-offset-0"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label htmlFor="new-type-desc" className="sr-only">Descripción (opcional)</label>
                <input
                  id="new-type-desc"
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black focus:ring-offset-0"
                />
              </div>
              <button
                type="button"
                onClick={createAndAddDocumentType}
                disabled={creatingType || !newTypeName.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {creatingType ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {creatingType ? 'Creando...' : 'Dar de alta y asignar'}
              </button>
            </div>
            {createTypeError && (
              <p className="mt-2 text-sm text-red-600 font-medium">{createTypeError}</p>
            )}
          </div>
          {documentTypesList.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-yellow-50">
              <p className="text-gray-700 text-sm font-semibold mb-2">⚠️ No hay tipos de documentos disponibles</p>
              <p className="text-gray-600 text-xs mb-4">Necesitas ejecutar el seed de la base de datos para cargar los tipos predefinidos</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Ejecuta en la terminal:</p>
                <code className="bg-gray-200 px-2 py-1 rounded block mt-2">npm run seed</code>
                <p className="mt-2">O si el servidor está corriendo:</p>
                <code className="bg-gray-200 px-2 py-1 rounded block">curl -X POST http://localhost:3000/api/seed</code>
              </div>
            </div>
          ) : (
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {documentTypesList.map((docType) => {
                  const isChecked = formData.documentTypes.includes(docType._id);
                  return (
                    <label
                      key={docType._id}
                      className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                        isChecked
                          ? 'bg-black border-black text-white'
                          : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDocumentType(docType._id)}
                        className="w-5 h-5 rounded border-2 border-gray-400 text-black focus:ring-2 focus:ring-black focus:ring-offset-2 cursor-pointer"
                        style={{ accentColor: isChecked ? '#ffffff' : '#000000' }}
                      />
                      <span className={`text-sm font-medium flex-1 ${isChecked ? 'text-white' : 'text-gray-900'}`}>
                        {docType.name}
                      </span>
                      {docType.description && (
                        <span className={`text-xs ${isChecked ? 'text-gray-300' : 'text-gray-500'}`}>
                          {docType.description}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              {formData.documentTypes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{formData.documentTypes.length}</span> tipo(s) seleccionado(s)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
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
            {loading ? 'Guardando...' : initialData?._id ? 'Actualizar Proyecto' : 'Crear Proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}
