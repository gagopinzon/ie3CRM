'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Project, KanbanColumn } from '@/shared/types';
import KanbanColumnComponent from './KanbanColumn';

interface KanbanBoardProps {
  initialColumns: KanbanColumn[];
  initialProjects: Project[];
}

export default function KanbanBoard({ initialColumns, initialProjects }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');

  const getClientDisplay = (client: unknown): string => {
    if (typeof client === 'string') return client;
    if (!client || typeof client !== 'object') return '—';
    const anyClient = client as any;
    return (
      (typeof anyClient.companyName === 'string' && anyClient.companyName) ||
      (typeof anyClient.name === 'string' && anyClient.name) ||
      (typeof anyClient._id === 'string' && anyClient._id) ||
      '—'
    );
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientDisplay((project as any).client).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMoveProject = async (projectId: string, newColumn: string) => {
    try {
      const response = await fetch('/api/kanban/move', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          kanbanColumn: newColumn,
        }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? updatedProject : p))
        );
      }
    } catch (error) {
      console.error('Error moving project:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <input
            type="text"
            placeholder="Buscar proyectos..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnProjects = filteredProjects.filter(
              (p) => p.kanbanColumn === column.name
            );
            return (
              <KanbanColumnComponent
                key={column._id}
                column={column}
                projects={columnProjects}
                onMoveProject={handleMoveProject}
              />
            );
          })}
        </div>
      </div>
    </DndProvider>
  );
}
