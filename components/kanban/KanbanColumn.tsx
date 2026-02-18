'use client';

import { useDrop } from 'react-dnd';
import { Project, KanbanColumn as KanbanColumnType } from '@/shared/types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  column: KanbanColumnType;
  projects: Project[];
  onMoveProject: (projectId: string, newColumn: string) => void;
}

export default function KanbanColumnComponent({
  column,
  projects,
  onMoveProject,
}: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'project',
    drop: (item: { project: Project }) => {
      if (item.project.kanbanColumn !== column.name) {
        onMoveProject(item.project._id, column.name);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 ${
        isOver ? 'bg-indigo-50 border-2 border-indigo-300' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">{column.name}</h3>
        <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-sm">
          {projects.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {projects.map((project) => (
          <KanbanCard key={project._id} project={project} />
        ))}
        {projects.length === 0 && (
          <div className="text-center text-gray-400 py-8 text-sm">
            No hay proyectos
          </div>
        )}
      </div>
    </div>
  );
}
