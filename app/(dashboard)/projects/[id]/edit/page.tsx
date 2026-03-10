import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import DocumentType from '@/models/DocumentType';
import ProjectTask from '@/models/ProjectTask';
import '@/models/InventoryItem';
import ProjectInventoryAssignment from '@/models/ProjectInventoryAssignment';
import User from '@/models/User';
import ProjectPageContent from '@/components/projects/ProjectPageContent';

async function getProjectData(id: string) {
  await connectDB();
  const Client = (await import('@/models/Client')).default;
  const [project, documentTypes, clients, tasks, users, inventoryAssignments] = await Promise.all([
    Project.findById(id).populate('documentTypes').populate('client'),
    DocumentType.find().sort({ name: 1 }),
    Client.find({ status: 'active' }).sort({ companyName: 1 }),
    ProjectTask.find({ projectId: id }).populate('createdBy', 'name').populate('assignedTo', 'name').sort({ order: 1 }),
    User.find().select('_id name').sort({ name: 1 }).lean(),
    ProjectInventoryAssignment.find({ projectId: id })
      .populate('inventoryItemId', 'name type quantity unit')
      .sort({ startDate: 1 })
      .lean(),
  ]);

  if (!project) return null;

  const inventorySerialized = (inventoryAssignments as any[]).map((a: any) => ({
    _id: a._id.toString(),
    inventoryItemId:
      (a.inventoryItemId as any)?._id?.toString?.() ??
      (a.inventoryItemId as any)?.toString?.() ??
      '',
    inventoryItem: a.inventoryItemId
      ? {
          _id: (a.inventoryItemId as any)._id?.toString() ?? '',
          name: (a.inventoryItemId as any).name ?? '',
          type: (a.inventoryItemId as any).type ?? '',
          quantity: Number((a.inventoryItemId as any).quantity) || 0,
          unit: (a.inventoryItemId as any).unit ?? undefined,
        }
      : null,
    startDate: a.startDate ? new Date(a.startDate).toISOString() : '',
    endDate: a.endDate ? new Date(a.endDate).toISOString() : '',
    quantity: Number(a.quantity) || 0,
    notes: typeof a.notes === 'string' ? a.notes : undefined,
  }));

  return {
    project: JSON.parse(JSON.stringify(project)),
    documentTypes: JSON.parse(JSON.stringify(documentTypes)),
    clients: JSON.parse(JSON.stringify(clients)),
    tasks: JSON.parse(JSON.stringify(tasks)),
    users: JSON.parse(JSON.stringify(users)),
    inventoryAssignments: inventorySerialized,
  };
}

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const data = await getProjectData(params.id);

  if (!data) {
    redirect('/projects');
  }

  return (
    <DashboardLayout>
      <ProjectPageContent
        documentTypes={data.documentTypes}
        clients={data.clients}
        initialData={{
          _id: data.project._id,
          name: data.project.name,
          description: data.project.description,
          client: typeof data.project.client === 'object' ? data.project.client._id : data.project.client,
          documentTypes: data.project.documentTypes.map((dt: { _id: string }) => dt._id),
          kanbanColumn: data.project.kanbanColumn,
          progress: data.project.progress || 0,
          locationLat: data.project.locationLat ?? null,
          locationLng: data.project.locationLng ?? null,
          locationAddress: data.project.locationAddress ?? null,
        }}
        projectId={params.id}
        tasks={data.tasks}
        users={data.users}
        inventoryAssignments={data.inventoryAssignments}
      />
    </DashboardLayout>
  );
}
