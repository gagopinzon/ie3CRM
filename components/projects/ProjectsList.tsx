'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Project } from '@/shared/types';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface ProjectsListProps {
  initialProjects: Project[];
}

export default function ProjectsList({ initialProjects }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data || []);
      } else {
        console.error('Error fetching projects:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recargar proyectos cuando el componente se monta
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProjects();
      } else {
        alert('Error al eliminar el proyecto');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error al eliminar el proyecto');
    }
  };

  if (loading && projects.length === 0) {
    return <div className="text-center py-8">Cargando proyectos...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No hay proyectos aún</p>
        <Link
          href="/projects/new"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
        >
          Crear tu primer proyecto
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progreso
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project._id} className="hover:bg-gray-50">
                <td className="px-6 py-5">
                  <div className="max-w-[34rem]">
                    <div className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight text-gray-900 break-words">
                      {project.name}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 truncate max-w-xs">
                      {project.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof project.client === 'object' ? project.client.companyName : project.client}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        (project.progress || 0) >= 100
                          ? 'bg-green-600'
                          : (project.progress || 0) >= 50
                          ? 'bg-blue-600'
                          : 'bg-gray-600'
                      }`}
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {project.progress || 0}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/projects/${project._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Ver"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/projects/${project._id}/edit`}
                      className="text-gray-600 hover:text-gray-900"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(project._id)}
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
