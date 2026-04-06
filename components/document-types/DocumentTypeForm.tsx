'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
}

interface DocumentTypeFormProps {
  categories: Category[];
  initialData?: {
    _id?: string;
    name?: string;
    description?: string;
    category?: string | Category;
    allowedFileTypes?: string[];
    requiresAddress?: boolean;
  };
}

const fileTypeCategories = [
  { value: 'imagen', label: 'Imagen', description: 'JPG, PNG, GIF, SVG, etc.' },
  { value: 'documento', label: 'Documento', description: 'PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, etc.' },
  { value: 'ubicacion', label: 'Ubicación', description: 'KML, KMZ, coordenadas, mapas, etc.' },
];

export default function DocumentTypeForm({ categories, initialData }: DocumentTypeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: typeof initialData?.category === 'object' ? initialData.category._id : (initialData?.category || ''),
    allowedFileTypes: initialData?.allowedFileTypes || ['documento'],
    requiresAddress: initialData?.requiresAddress || false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.category) {
        throw new Error('Por favor selecciona una categoría');
      }

      const url = initialData?._id ? `/api/document-types/${initialData._id}` : '/api/document-types';
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
        throw new Error(data.error || 'Error al guardar el tipo de documento');
      }

      router.push('/document-types');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFileType = (fileType: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.includes(fileType)
        ? prev.allowedFileTypes.filter((type) => type !== fileType)
        : [...prev.allowedFileTypes, fileType],
    }));
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
            Nombre del Tipo de Documento *
          </label>
          <input
            type="text"
            id="name"
            required
            className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium placeholder-gray-400"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Planos, Mapa, Cotización"
          />
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
            placeholder="Descripción del tipo de documento..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="category" className="block text-sm font-semibold text-gray-900">
              Categoría *
            </label>
            <Link
              href="/categories/new"
              className="text-xs text-black hover:text-gray-700 font-semibold"
              target="_blank"
            >
              + Nueva Categoría
            </Link>
          </div>
          {categories.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-yellow-50">
              <p className="text-sm text-gray-700 mb-2">No hay categorías registradas</p>
              <Link
                href="/categories/new"
                className="text-sm text-black hover:text-gray-700 font-semibold"
              >
                Crear primera categoría →
              </Link>
            </div>
          ) : (
            <select
              id="category"
              className="w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-black sm:text-sm px-4 py-3 bg-white text-gray-900 font-medium"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Tipos de Archivo Permitidos *
          </label>
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fileTypeCategories.map((category) => {
                const isSelected = formData.allowedFileTypes.includes(category.value);
                return (
                  <label
                    key={category.value}
                    className={`flex flex-col cursor-pointer p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFileType(category.value)}
                        className="w-5 h-5 rounded border-2 border-gray-400 text-black focus:ring-2 focus:ring-black cursor-pointer"
                      />
                      <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {category.label}
                      </span>
                    </div>
                    <span className={`text-xs ml-8 ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                      {category.description}
                    </span>
                  </label>
                );
              })}
            </div>
            {formData.allowedFileTypes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">{formData.allowedFileTypes.length}</span> categoría(s) seleccionada(s):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.allowedFileTypes.map((type) => {
                    const category = fileTypeCategories.find((cat) => cat.value === type);
                    return (
                      <span
                        key={type}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-lg text-sm font-medium"
                      >
                        {category?.label || type}
                        <button
                          type="button"
                          onClick={() => toggleFileType(type)}
                          className="hover:text-gray-300"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requiresAddress}
              onChange={(e) => setFormData({ ...formData, requiresAddress: e.target.checked })}
              className="w-5 h-5 rounded border-2 border-gray-400 text-black focus:ring-2 focus:ring-black cursor-pointer"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900">Requiere Dirección</span>
              <p className="text-xs text-gray-600">
                Marca esta opción si este tipo de documento necesita una dirección (ej: Mapa, Ubicación)
              </p>
            </div>
          </label>
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
            {loading ? 'Guardando...' : initialData?._id ? 'Actualizar Tipo' : 'Crear Tipo de Documento'}
          </button>
        </div>
      </form>
    </div>
  );
}
