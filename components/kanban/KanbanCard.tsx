'use client';

import { useDrag } from 'react-dnd';
import { Project } from '@/shared/types';
import Link from 'next/link';
import { FileText } from 'lucide-react';

interface KanbanCardProps {
  project: Project;
}

export default function KanbanCard({ project }: KanbanCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'project',
    item: { project },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Link href={`/projects/${project._id}`}>
      <div
        ref={drag}
        className={`bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{project.client}</span>
          <div className="flex items-center gap-1">
            <FileText size={14} />
            <span>{project.documentTypes?.length || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
