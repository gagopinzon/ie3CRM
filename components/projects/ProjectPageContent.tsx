'use client';

import ProjectForm from '@/components/projects/ProjectForm';
import ProjectTasksKanban from '@/components/projects/ProjectTasksKanban';
import ProjectLocationSection from '@/components/projects/ProjectLocationSection';
import ProjectInventorySection from '@/components/projects/ProjectInventorySection';
import { DocumentType } from '@/shared/types';

export interface ProjectPageContentProps {
  documentTypes: DocumentType[];
  clients: { _id: string; companyName: string }[];
  initialData?: {
    _id?: string;
    name?: string;
    description?: string;
    client?: string;
    documentTypes?: string[];
    kanbanColumn?: string;
    progress?: number;
    locationLat?: number | null;
    locationLng?: number | null;
    locationAddress?: string | null;
  };
  /** Solo en edición: id del proyecto, tareas y usuarios para asignar */
  projectId?: string;
  tasks?: any[];
  users?: { _id: string; name: string }[];
  inventoryAssignments?: Array<{
    _id: string;
    inventoryItemId: string;
    inventoryItem: { _id: string; name: string; type: string; quantity: number; unit?: string } | null;
    startDate: string;
    endDate: string;
    quantity: number;
    notes?: string;
  }>;
}

/**
 * Contenido compartido para crear y editar proyecto.
 * Cualquier cambio aquí aplica tanto en /projects/new como en /projects/[id]/edit.
 */
export default function ProjectPageContent({
  documentTypes,
  clients,
  initialData,
  projectId,
  tasks = [],
  users = [],
  inventoryAssignments = [],
}: ProjectPageContentProps) {
  const isEdit = Boolean(initialData?._id);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="pt-1 lg:pt-0">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEdit ? 'Modifica la información del proyecto' : 'Crea un nuevo proyecto de ingeniería'}
        </p>
      </div>

      <ProjectForm
        documentTypes={documentTypes}
        clients={clients}
        initialData={initialData}
      />

      {projectId && (
        <div className="bg-white rounded-lg shadow-md sm:shadow-lg p-4 sm:p-6">
          <ProjectLocationSection
            projectId={projectId}
            readOnly={false}
            initialLocation={{
              address: initialData?.locationAddress ?? null,
              lat: initialData?.locationLat ?? undefined,
              lng: initialData?.locationLng ?? undefined,
            }}
          />
        </div>
      )}

      {projectId && (
        <ProjectInventorySection
          projectId={projectId}
          readOnly={false}
          initialAssignments={inventoryAssignments}
        />
      )}

      <div id="pasos-proyecto" className="bg-white rounded-lg shadow-md sm:shadow-lg p-4 sm:p-6 scroll-mt-6">
        {projectId ? (
          <ProjectTasksKanban projectId={projectId} initialTasks={(tasks ?? []) as any} users={users} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="font-medium">Tareas del proyecto</p>
            <p className="text-sm mt-1">Guarda el proyecto para poder agregar y gestionar tareas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
