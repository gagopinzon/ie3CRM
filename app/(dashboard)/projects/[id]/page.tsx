import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectDocument from '@/models/ProjectDocument';
import Link from 'next/link';
import { ArrowLeft, Edit, Building2, User, Phone, Mail, MapPin, FileText, Calendar, TrendingUp } from 'lucide-react';
import ProjectDocumentsByType from '@/components/projects/ProjectDocumentsByType';
import ProjectNotes from '@/components/projects/ProjectNotes';
import ProjectTasksKanban from '@/components/projects/ProjectTasksKanban';

async function getProject(id: string) {
  await connectDB();
  const Client = (await import('@/models/Client')).default;
  const project = await Project.findById(id)
    .populate('assignedTo', 'name email')
    .populate('documentTypes', 'name description')
    .populate('client');

  if (!project) return null;

  const ProjectNote = (await import('@/models/ProjectNote')).default;
  const ProjectTask = (await import('@/models/ProjectTask')).default;
  
  const [documents, notes, tasks] = await Promise.all([
    ProjectDocument.find({ projectId: id })
      .populate('documentTypeId', 'name description')
      .populate('uploadedBy', 'name')
      .sort({ uploadedAt: -1 }),
    ProjectNote.find({ projectId: id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 }),
    ProjectTask.find({ projectId: id })
      .populate('createdBy', 'name')
      .sort({ order: 1, createdAt: 1 }),
  ]);

  // Obtener datos completos del cliente si existe
  let clientData = null;
  if (project.client) {
    const clientId = typeof project.client === 'object' ? project.client._id : project.client;
    clientData = await Client.findById(clientId);
  }

  return {
    project: JSON.parse(JSON.stringify(project)),
    documents: JSON.parse(JSON.stringify(documents)),
    notes: JSON.parse(JSON.stringify(notes)),
    tasks: JSON.parse(JSON.stringify(tasks)),
    client: clientData ? JSON.parse(JSON.stringify(clientData)) : null,
  };
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const data = await getProject(params.id);

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Proyecto no encontrado</p>
          <Link href="/projects" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
            Volver a proyectos
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const client = data.client;
  const progress = data.project.progress || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/projects"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{data.project.name}</h1>
                {client && (
                  <Link
                    href={`/clients/${client._id}`}
                    className="text-gray-600 hover:text-black mt-1 inline-flex items-center gap-2 transition-colors"
                  >
                    <Building2 size={16} />
                    <span className="font-medium">{client.companyName}</span>
                  </Link>
                )}
              </div>
            </div>
            <Link
              href={`/projects/${params.id}/edit`}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
            >
              <Edit size={20} />
              Editar Proyecto
            </Link>
          </div>

          {/* Barra de Progreso Principal */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progreso del Proyecto</span>
              <span className="text-lg font-bold text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  progress >= 100
                    ? 'bg-green-600'
                    : progress >= 75
                    ? 'bg-blue-600'
                    : progress >= 50
                    ? 'bg-yellow-600'
                    : 'bg-gray-600'
                }`}
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && `${progress}%`}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda - Información del Proyecto y Cliente */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información del Proyecto */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-gray-700" />
                Información del Proyecto
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Descripción</label>
                  <p className="text-gray-900 mt-1 font-medium">{data.project.description}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
                  <div className="mt-1">
                    <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                      {data.project.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Tipos de Documentos</label>
                  <div className="flex flex-wrap gap-2">
                    {data.project.documentTypes && data.project.documentTypes.length > 0 ? (
                      data.project.documentTypes.map((docType: any) => (
                        <span
                          key={docType._id}
                          className="px-3 py-1 bg-black text-white rounded-lg text-xs font-semibold"
                        >
                          {docType.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Sin tipos asignados</span>
                    )}
                  </div>
                </div>
                {data.project.createdAt && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                      <Calendar size={14} />
                      Fecha de Creación
                    </label>
                    <p className="text-gray-900 mt-1 font-medium">
                      {new Date(data.project.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Cliente */}
            {client && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 size={24} className="text-gray-700" />
                  Información del Cliente
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Empresa</label>
                    <p className="text-gray-900 mt-1 font-bold text-lg">{client.companyName}</p>
                    {client.rfc && (
                      <p className="text-gray-600 text-sm mt-1">RFC: {client.rfc}</p>
                    )}
                  </div>

                  {client.address && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                        <MapPin size={14} />
                        Dirección
                      </label>
                      <p className="text-gray-900 mt-1 font-medium">{client.address}</p>
                      {(client.city || client.state) && (
                        <p className="text-gray-600 text-sm">
                          {[client.city, client.state, client.zipCode].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {client.contacts && client.contacts.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Contactos</label>
                      <div className="space-y-3">
                        {client.contacts.map((contact: any, index: number) => (
                          <div key={index} className="border-l-4 border-gray-300 pl-3 py-2 bg-gray-50 rounded-r">
                            <p className="font-bold text-gray-900">{contact.name}</p>
                            {contact.position && (
                              <p className="text-sm text-gray-600">{contact.position}</p>
                            )}
                            <div className="mt-2 space-y-1">
                              {contact.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Phone size={14} />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                              {contact.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Mail size={14} />
                                  <a href={`mailto:${contact.email}`} className="hover:text-black">
                                    {contact.email}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/clients/${client._id}`}
                    className="block text-center mt-4 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
                  >
                    Ver Detalles del Cliente
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha - Documentos y Notas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Documentos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={24} className="text-gray-700" />
                Documentos del Proyecto
              </h2>
              <ProjectDocumentsByType
                projectId={params.id}
                documentTypes={data.project.documentTypes || []}
                initialDocuments={data.documents}
              />
            </div>

            {/* Tablero Kanban de Tareas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-gray-700" />
                Avance del Proyecto
              </h2>
              <ProjectTasksKanban projectId={params.id} initialTasks={data.tasks || []} readOnly={true} />
            </div>

            {/* Bitácora y Notas */}
            <ProjectNotes projectId={params.id} initialNotes={data.notes} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
