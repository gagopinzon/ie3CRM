'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, Upload } from 'lucide-react';
import { DocumentType, ProjectDocument } from '@/shared/types';

interface DocumentUploadModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: (document: ProjectDocument) => void;
}

export default function DocumentUploadModal({
  projectId,
  onClose,
  onSuccess,
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    fetch('/api/document-types')
      .then((res) => res.json())
      .then((data) => {
        setDocumentTypes(data);
        setLoadingTypes(false);
      })
      .catch(() => setLoadingTypes(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    if (!documentTypeId) {
      setError('Por favor selecciona un tipo de documento');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('documentTypeId', documentTypeId);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir el archivo');
      }

      const data = await response.json();
      onSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Subir Documento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento *
            </label>
            {loadingTypes ? (
              <p className="text-gray-500">Cargando tipos...</p>
            ) : (
              <select
                id="documentType"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border uppercase tracking-wide"
                value={documentTypeId}
                onChange={(e) => setDocumentTypeId(e.target.value)}
              >
                <option value="">Selecciona un tipo</option>
                {documentTypes.map((dt) => (
                  <option key={dt._id} value={dt._id}>
                    {dt.name.toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Archivo *
            </label>
            <input
              type="file"
              id="file"
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={20} />
              {loading ? 'Subiendo...' : 'Subir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
