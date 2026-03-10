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
import ProjectLocationSection from '@/components/projects/ProjectLocationSection';
import ProjectNotes from '@/components/projects/ProjectNotes';
import ProjectTasksKanban from '@/components/projects/ProjectTasksKanban';
import ProjectActivitiesCalendar from '@/components/projects/ProjectActivitiesCalendar';
import ProjectInventorySection from '@/components/projects/ProjectInventorySection';

async function getProject(id: string) {
  await connectDB();
  // Registrar esquemas necesarios para los populate (DocumentType, Client, etc.)
  await import('@/models/DocumentType');
  const Client = (await import('@/models/Client')).default;
  const project = await Project.findById(id)
    .populate('assignedTo', 'name email')
    .populate('documentTypes', 'name description allowedFileTypes')
    .populate('client');

  if (!project) return null;

  const ProjectNote = (await import('@/models/ProjectNote')).default;
  const ProjectTask = (await import('@/models/ProjectTask')).default;
  await import('@/models/InventoryItem');
  const ProjectInventoryAssignment = (await import('@/models/ProjectInventoryAssignment')).default;

  const [documents, notes, tasks, inventoryAssignments] = await Promise.all([
    ProjectDocument.find({ projectId: id })
      .populate('documentTypeId', 'name description')
      .populate('uploadedBy', 'name')
      .sort({ uploadedAt: -1 }),
    ProjectNote.find({ projectId: id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 }),
    ProjectTask.find({ projectId: id })
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ order: 1, createdAt: 1 }),
    ProjectInventoryAssignment.find({ projectId: id })
      .populate('inventoryItemId', 'name type quantity unit')
      .sort({ startDate: 1 })
      .lean(),
  ]);

  // Obtener datos completos del cliente si existe
  let clientData = null;
  if (project.client) {
    const clientRef: any = (project as any).client;
    const clientId = clientRef && typeof clientRef === 'object' ? clientRef._id : clientRef;
    clientData = await Client.findById(clientId);
  }

  const projectData = JSON.parse(JSON.stringify(project));
  const documentTypes = (projectData.documentTypes || []).filter((dt: { _id?: string }) => dt && dt._id);

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
    project: { ...projectData, documentTypes },
    documents: JSON.parse(JSON.stringify(documents)),
    notes: JSON.parse(JSON.stringify(notes)),
    tasks: JSON.parse(JSON.stringify(tasks)),
    inventoryAssignments: inventorySerialized,
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
        {/* Header: 1/3 Información del Cliente, 2/3 nombre + avance + editar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1/3 — Información del Cliente */}
          {client && (
            <div className="lg:col-span-1 min-w-0">
              <div className="bg-white rounded-lg shadow-lg p-6 h-full">
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
            </div>
          )}
          {/* 2/3 — Nombre del proyecto, botón editar, barra de progreso (ancho completo si no hay cliente) */}
          <div className={`min-w-0 ${client ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Link
                    href="/projects"
                    className="text-gray-600 hover:text-gray-900 transition-colors shrink-0"
                  >
                    <ArrowLeft size={24} />
                  </Link>
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{data.project.name}</h1>
                    {client && (
                      <Link
                        href={`/clients/${client._id}`}
                        className="text-gray-600 hover:text-black mt-1 inline-flex items-center gap-2 transition-colors text-sm"
                      >
                        <Building2 size={16} className="shrink-0" />
                        <span className="font-medium truncate">{client.companyName}</span>
                      </Link>
                    )}
                  </div>
                </div>
                <Link
                  href={`/projects/${params.id}/edit`}
                  className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold shrink-0"
                >
                  <Edit size={20} />
                  Editar Proyecto
                </Link>
              </div>
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
          </div>
        </div>

        {/* Arriba: Información del proyecto 1/3, Bitácora + Notas 2/3 (Bitácora arriba, Notas abajo) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* 1/3 — Información del Proyecto + Información del Cliente */}
          <div className="lg:col-span-1 min-w-0 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 shrink-0">
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
                {client && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2 mb-2">
                      <Building2 size={14} />
                      Cliente
                    </label>
                    <div className="mt-1 space-y-1">
                      <Link
                        href={`/clients/${client._id}`}
                        className="text-gray-900 font-bold text-base hover:text-black hover:underline block"
                      >
                        {client.companyName}
                      </Link>
                      {client.rfc && (
                        <p className="text-gray-600 text-sm">RFC: {client.rfc}</p>
                      )}
                      {client.address && (
                        <p className="text-gray-600 text-sm">
                          <span className="inline-flex items-start gap-1">
                            <MapPin size={14} className="shrink-0 mt-0.5" />
                            <span>{client.address}</span>
                          </span>
                          {(client.city || client.state) && (
                            <span className="block text-gray-500 text-xs mt-0.5 pl-5">
                              {[client.city, client.state, client.zipCode].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </p>
                      )}
                      {client.contacts && client.contacts.length > 0 && (
                        <div className="text-gray-600 text-sm space-y-0.5">
                          {client.contacts.slice(0, 2).map((contact: any, idx: number) => (
                            <p key={idx} className="flex items-center gap-1">
                              <User size={14} className="shrink-0" />
                              <span className="font-medium">{contact.name}</span>
                              {contact.phone && <span> · {contact.phone}</span>}
                              {contact.email && (
                                <a href={`mailto:${contact.email}`} className="text-black hover:underline ml-1">
                                  {contact.email}
                                </a>
                              )}
                            </p>
                          ))}
                          {client.contacts.length > 2 && (
                            <p className="text-xs text-gray-500">+{client.contacts.length - 2} contacto(s) más</p>
                          )}
                        </div>
                      )}
                      <Link
                        href={`/clients/${client._id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:underline mt-2"
                      >
                        Ver detalles del cliente
                      </Link>
                    </div>
                  </div>
                )}
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
                {(data.project.documentTypes?.some(
                  (dt: any) =>
                    dt.name?.toLowerCase().includes('ubicación') ||
                    dt.name?.toLowerCase().includes('ubicacion') ||
                    dt.allowedFileTypes?.includes('ubicacion')
                ) ||
                  data.project.locationAddress ||
                  (data.project.locationLat != null && data.project.locationLng != null)) && (
                  <ProjectLocationSection
                    projectId={params.id}
                    readOnly
                    initialLocation={{
                      address: data.project.locationAddress ?? null,
                      lat: data.project.locationLat,
                      lng: data.project.locationLng,
                    }}
                  />
                )}
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
          </div>
          {/* 2/3 — Bitácora, Notas del proyecto, Calendario de actividades */}
          <section className="lg:col-span-2 min-w-0 flex flex-col gap-6" aria-label="Bitácora, notas y calendario">
            <ProjectNotes projectId={params.id} initialNotes={data.notes} layout="stacked" />
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 overflow-hidden" aria-labelledby="calendario-heading">
              <h2 id="calendario-heading" className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={22} className="text-gray-700 shrink-0" />
                Calendario de actividades
              </h2>
              <div className="w-full min-w-0">
                <ProjectActivitiesCalendar tasks={data.tasks || []} notes={data.notes || []} />
              </div>
            </div>
          </section>
        </div>

        {/* Materiales por fecha */}
        <div className="mt-6">
          <ProjectInventorySection
            projectId={params.id}
            readOnly
            initialAssignments={data.inventoryAssignments || []}
          />
        </div>

        {/* Avance del Proyecto — 100% del ancho, separado del grid */}
        <section className="w-full bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 overflow-x-auto mt-6 relative z-0" aria-labelledby="avance-heading">
          <h2 id="avance-heading" className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={22} className="text-gray-700 shrink-0" />
            Avance del Proyecto
          </h2>
          <div className="w-full min-w-0">
            <ProjectTasksKanban projectId={params.id} initialTasks={data.tasks || []} readOnly={true} />
          </div>
        </section>

        {/* Documentos del Proyecto */}
        <div id="documentos" className="bg-white rounded-lg shadow-lg p-6 scroll-mt-6">
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
      </div>
    </DashboardLayout>
  );
}
