'use client';

import { useState, useEffect, FormEvent } from 'react';
import { ProjectDocument } from '@/shared/types';
import { Upload, Download, Trash2, FileText, Plus, X } from 'lucide-react';

interface DocumentType {
  _id: string;
  name: string;
  description?: string;
}

interface ProjectDocumentsByTypeProps {
  projectId: string;
  documentTypes: DocumentType[];
  initialDocuments: ProjectDocument[];
}

export default function ProjectDocumentsByType({
  projectId,
  documentTypes,
  initialDocuments,
}: ProjectDocumentsByTypeProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>(initialDocuments);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (docId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc._id !== docId));
      } else {
        alert('Error al eliminar el documento');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error al eliminar el documento');
    }
  };

  const handleFileSelect = (typeId: string, selectedFile: File | null) => {
    setUploadingType(typeId);
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async (e: FormEvent, documentTypeId: string) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Por favor selecciona un archivo');
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

      const newDocument = await response.json();
      setDocuments([newDocument, ...documents]);
      setFile(null);
      setUploadingType(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setUploadingType(null);
    setError(null);
  };

  const getDocumentsByType = (typeId: string) => {
    return documents.filter((doc) => (doc as any).documentTypeId?._id === typeId || (doc as any).documentTypeId === typeId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {documentTypes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Este proyecto no tiene tipos de documentos asignados</p>
        </div>
      ) : (
        documentTypes.map((docType) => {
          const typeDocuments = getDocumentsByType(docType._id);
          const isUploading = uploadingType === docType._id;

          return (
            <div key={docType._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{docType.name}</h3>
                  {docType.description && (
                    <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
                  )}
                </div>
                {!isUploading && (
                  <button
                    onClick={() => setUploadingType(docType._id)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
                  >
                    <Plus size={20} />
                    Agregar {docType.name}
                  </button>
                )}
              </div>

              {isUploading && (
                <form
                  onSubmit={(e) => handleUpload(e, docType._id)}
                  className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-300"
                >
                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-900 px-4 py-3 rounded font-medium">
                      {error}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-900"
                      onChange={(e) => handleFileSelect(docType._id, e.target.files?.[0] || null)}
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading || !file}
                      className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      <Upload size={20} />
                      {loading ? 'Subiendo...' : 'Subir'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelUpload}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </form>
              )}

              {typeDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No hay documentos de este tipo aún</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                          Nombre
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                          Tamaño
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                          Subido por
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {typeDocuments.map((doc) => (
                        <tr key={doc._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doc.fileName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(doc.fileSize)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {(doc as any).uploadedBy?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-black hover:text-gray-700"
                                title="Descargar"
                              >
                                <Download size={18} />
                              </a>
                              <button
                                onClick={() => handleDelete(doc._id)}
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
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
