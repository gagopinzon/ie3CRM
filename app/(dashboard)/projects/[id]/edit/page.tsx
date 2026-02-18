import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import DocumentType from '@/models/DocumentType';
import ProjectTask from '@/models/ProjectTask';
import ProjectForm from '@/components/projects/ProjectForm';
import ProjectTasksKanban from '@/components/projects/ProjectTasksKanban';

async function getProjectData(id: string) {
  await connectDB();
  const Client = (await import('@/models/Client')).default;
  const [project, documentTypes, clients, tasks] = await Promise.all([
    Project.findById(id).populate('documentTypes').populate('client'),
    DocumentType.find().sort({ name: 1 }),
    Client.find({ status: 'active' }).sort({ companyName: 1 }),
    ProjectTask.find({ projectId: id }).populate('createdBy', 'name').sort({ order: 1 }),
  ]);

  if (!project) return null;

  return {
    project: JSON.parse(JSON.stringify(project)),
    documentTypes: JSON.parse(JSON.stringify(documentTypes)),
    clients: JSON.parse(JSON.stringify(clients)),
    tasks: JSON.parse(JSON.stringify(tasks)),
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Proyecto</h1>
          <p className="text-gray-600 mt-2">Modifica la información del proyecto</p>
        </div>

        <ProjectForm
          documentTypes={data.documentTypes}
          clients={data.clients}
          initialData={{
            _id: data.project._id,
            name: data.project.name,
            description: data.project.description,
            client: typeof data.project.client === 'object' ? data.project.client._id : data.project.client,
            documentTypes: data.project.documentTypes.map((dt: any) => dt._id),
            kanbanColumn: data.project.kanbanColumn,
            progress: data.project.progress || 0,
          }}
        />

        <div className="bg-white rounded-lg shadow-lg p-6">
          <ProjectTasksKanban projectId={params.id} initialTasks={data.tasks} />
        </div>
      </div>
    </DashboardLayout>
  );
}
