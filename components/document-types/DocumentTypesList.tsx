'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, FileText, MapPin } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface DocumentType {
  _id: string;
  name: string;
  description?: string;
  category?: string | Category;
  allowedFileTypes?: string[];
  requiresAddress?: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface DocumentTypesListProps {
  initialDocumentTypes: DocumentType[];
  initialCategories?: Category[];
}

export default function DocumentTypesList({ initialDocumentTypes, initialCategories = [] }: DocumentTypesListProps) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes || []);
  const [loading, setLoading] = useState(false);

  const fetchDocumentTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/document-types');
      if (response.ok) {
        const data = await response.json();
        setDocumentTypes(data || []);
      }
    } catch (error) {
      console.error('Error fetching document types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este tipo de documento?')) return;

    try {
      const response = await fetch(`/api/document-types/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDocumentTypes();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar el tipo de documento');
      }
    } catch (error) {
      console.error('Error deleting document type:', error);
      alert('Error al eliminar el tipo de documento');
    }
  };

  if (loading && documentTypes.length === 0) {
    return <div className="text-center py-8">Cargando tipos de documentos...</div>;
  }

  if (documentTypes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <FileText size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No hay tipos de documentos registrados</p>
        <Link
          href="/document-types/new"
          className="mt-4 inline-block text-black hover:text-gray-700 font-semibold"
        >
          Crear tu primer tipo de documento
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
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Tipos de Archivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Requiere Dirección
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documentTypes.map((docType) => (
              <tr key={docType._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText size={20} className="text-gray-400 mr-2" />
                    <div className="text-sm font-semibold text-gray-900">{docType.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 max-w-xs truncate">
                    {docType.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {docType.category ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {typeof docType.category === 'object' ? docType.category.name : docType.category}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {docType.allowedFileTypes && docType.allowedFileTypes.length > 0 ? (
                      docType.allowedFileTypes.map((type, idx) => {
                        const labels: Record<string, string> = {
                          imagen: 'Imagen',
                          documento: 'Documento',
                          ubicacion: 'Ubicación',
                        };
                        return (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs font-medium bg-black text-white rounded"
                          >
                            {labels[type] || type}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {docType.requiresAddress ? (
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin size={16} className="text-gray-400 mr-2" />
                      <span className="font-medium">Sí</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/document-types/${docType._id}/edit`}
                      className="text-gray-600 hover:text-gray-900"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(docType._id)}
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
