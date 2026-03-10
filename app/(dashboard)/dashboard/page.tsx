import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectTask from '@/models/ProjectTask';
import ProjectNote from '@/models/ProjectNote';
import Client from '@/models/Client';
import ActivityLog from '@/models/ActivityLog';
import '@/models/DocumentType'; // Registrar modelo para refs en Project
import Link from 'next/link';
import { Edit, FileUp, Activity } from 'lucide-react';
import { getStatusLabel } from '@/lib/ui/workflowTheme';
import DashboardDeliveriesSection, { type TaskWithDue, type NoteEvent } from '@/components/dashboard/DashboardDeliveriesSection';

export const dynamic = 'force-dynamic';

const VALID_OBJECT_ID = /^[a-fA-F0-9]{24}$/;

function formatRelativeTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

async function getDashboardData(session: any) {
  await connectDB();

  const userId = session?.user && (session.user as any).id;
  const role = session?.user && (session.user as any).role;
  const permissions = (session?.user as any)?.permissions || {};
  const canViewAllTasks =
    role === 'admin' || permissions.canViewAllProjects || permissions.canEditAllProjects;

  const taskFilter: any = { dueDate: { $exists: true, $ne: null } };
  if (!canViewAllTasks && userId) {
    taskFilter.$or = [{ assignedTo: userId }, { createdBy: userId }];
  }

  const [projectsCount, projectsList, tasksWithDue, notesWithEventDate] =
    await Promise.all([
      Project.countDocuments({ status: 'active' }),
      Project.find({ status: 'active' })
        .select('name client kanbanColumn updatedAt progress createdAt')
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean(),
      ProjectTask.find(taskFilter)
        .populate('projectId', 'name')
        .populate('assignedTo', 'name')
        .populate('documentTypeId', 'name')
        .sort({ dueDate: 1 })
        .lean(),
      ProjectNote.find({ eventDate: { $exists: true, $ne: null } })
        .populate('projectId', 'name')
        .sort({ eventDate: 1 })
        .lean(),
    ]);

  const rawList = projectsList as { _id: unknown; name: string; client: unknown; kanbanColumn: string; progress?: number; createdAt?: Date }[];
  const validClientIds = [...new Set(
    rawList
      .map((p) => (typeof p.client === 'string' ? p.client : (p.client as { toString?: () => string })?.toString?.() ?? ''))
      .filter((id) => id && VALID_OBJECT_ID.test(id))
  )];

  const clientsList = validClientIds.length > 0
    ? await Client.find({ _id: { $in: validClientIds } }).select('companyName').lean()
    : [];
  const clientMap = Object.fromEntries(
    (clientsList as { _id: { toString: () => string }; companyName: string }[]).map((c) => [c._id.toString(), c.companyName])
  );

  const projectIds = rawList.map((p) => (p as { _id: unknown })._id);
  const maxDueByProject =
    projectIds.length > 0
      ? await ProjectTask.aggregate([
          { $match: { projectId: { $in: projectIds }, dueDate: { $exists: true, $ne: null } } },
          { $group: { _id: '$projectId', maxDueDate: { $max: '$dueDate' } } },
        ])
      : [];
  const maxDueMap = Object.fromEntries(
    maxDueByProject.map((r: { _id: unknown; maxDueDate: Date }) => [
      (r._id as { toString: () => string }).toString(),
      r.maxDueDate,
    ])
  );

  const todayForDue = new Date();
  todayForDue.setHours(0, 0, 0, 0);
  const oneDayMs = 24 * 60 * 60 * 1000;

  const projects = rawList.map((p) => {
    const clientId = typeof p.client === 'string' ? p.client : (p.client as { toString?: () => string })?.toString?.() ?? '';
    const clientName = clientId && VALID_OBJECT_ID.test(clientId) ? (clientMap[clientId] ?? '—') : '—';
    const id = (p as { _id: { toString: () => string } })._id.toString();
    const maxDue = maxDueMap[id] ? new Date(maxDueMap[id]) : null;
    let daysRemaining: number | null = null;
    if (maxDue) {
      const dueStart = new Date(maxDue);
      dueStart.setHours(0, 0, 0, 0);
      daysRemaining = Math.round((dueStart.getTime() - todayForDue.getTime()) / oneDayMs);
    }
    return {
      _id: id,
      name: p.name,
      client: clientName,
      kanbanColumn: p.kanbanColumn,
      progress: p.progress ?? 0,
      createdAt: p.createdAt ? new Date(p.createdAt) : null,
      maxDueDate: maxDue,
      daysRemaining,
    };
  });

  const tasksWithDueSerialized: TaskWithDue[] = (tasksWithDue as any[])
    .map((t): TaskWithDue | null => {
      if (!t.dueDate) return null;
      return {
        _id: t._id.toString(),
        title: t.title,
        dueDate: new Date(t.dueDate).toISOString(),
        status: t.status,
        projectId: t.projectId
          ? {
              _id: (t.projectId as any)._id?.toString?.() ?? t.projectId.toString(),
              name: (t.projectId as any).name ?? '—',
            }
          : '',
        assignedTo: Array.isArray(t.assignedTo)
          ? t.assignedTo.map((u: any) => ({
              _id: u._id?.toString?.() ?? u.toString(),
              name: (u as any).name ?? '—',
            }))
          : [],
        documentTypeId: t.documentTypeId
          ? {
              _id: (t.documentTypeId as any)._id?.toString?.() ?? (t.documentTypeId as any).toString?.(),
              name: (t.documentTypeId as any).name ?? '—',
            }
          : null,
      };
    })
    .filter((t): t is TaskWithDue => t !== null);

  const noteEventsSerialized: NoteEvent[] = (notesWithEventDate as any[])
    .map((n): NoteEvent | null => {
      if (!n.eventDate) return null;
      return {
        _id: n._id.toString(),
        content: n.content,
        eventDate: new Date(n.eventDate).toISOString(),
        projectId: n.projectId
          ? {
              _id: (n.projectId as any)._id?.toString?.() ?? n.projectId.toString(),
              name: (n.projectId as any).name ?? '—',
            }
          : null,
      };
    })
    .filter((n): n is NoteEvent => n !== null);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const dayOfWeek = now.getDay();
  const daysToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(todayStart);
  startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  let tasksDueToday = 0;
  let tasksDueThisWeek = 0;
  let tasksOverdue = 0;
  for (const t of tasksWithDueSerialized) {
    if (t.status === 'done') continue;
    const due = new Date(t.dueDate!);
    if (due < todayStart) tasksOverdue += 1;
    else if (due >= todayStart && due < todayEnd) tasksDueToday += 1;
    if (due >= todayStart && due <= endOfWeek) tasksDueThisWeek += 1;
  }

  let recentActivity: Array<{
    _id: string;
    type: 'project_status' | 'task_status';
    projectId: string;
    projectName: string;
    entityId: string;
    entityTitle?: string;
    previousValue: string;
    newValue: string;
    userName: string;
    createdAt: string;
  }> = [];
  if (role === 'admin') {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(30).lean();
    recentActivity = logs.map((log: any) => ({
      _id: log._id.toString(),
      type: log.type,
      projectId: log.projectId?.toString() ?? '',
      projectName: log.projectName ?? '—',
      entityId: log.entityId?.toString() ?? '',
      entityTitle: log.entityTitle,
      previousValue: log.previousValue ?? '',
      newValue: log.newValue ?? '',
      userName: log.userName ?? '—',
      createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : '',
    }));
  }

  return {
    totalProjects: projectsCount,
    tasksDueToday,
    tasksDueThisWeek,
    tasksOverdue,
    projects,
    tasksWithDue: tasksWithDueSerialized,
    noteEvents: noteEventsSerialized,
    recentActivity,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const data = await getDashboardData(session);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido, {session.user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Tareas para hoy</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.tasksDueToday}</p>
            <p className="text-xs text-gray-500 mt-1">entregas con fecha de hoy</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Tareas de esta semana</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.tasksDueThisWeek}</p>
            <p className="text-xs text-gray-500 mt-1">entregas hasta el domingo</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Proyectos activos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalProjects}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Entregas vencidas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.tasksOverdue}</p>
            <p className="text-xs text-gray-500 mt-1">pendientes de entregar</p>
          </div>
        </div>

        {data.recentActivity && data.recentActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={22} className="text-gray-700" />
              Últimos movimientos
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Cambios de estado en proyectos y tareas
            </p>
            <ul className="space-y-3 max-h-[320px] overflow-y-auto">
              {data.recentActivity.map((item) => (
                <li key={item._id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                  <span className="text-sm text-gray-700">
                    {item.type === 'project_status' ? (
                      <>
                        <strong>Proyecto</strong>{' '}
                        <Link href={`/projects/${item.projectId}`} className="text-indigo-600 hover:underline font-medium">
                          {item.projectName}
                        </Link>
                        : estado «{item.previousValue}» → «{item.newValue}»
                      </>
                    ) : (
                      <>
                        <strong>Tarea</strong> «{item.entityTitle || 'Sin título'}»
                        {' '}(proyecto{' '}
                        <Link href={`/projects/${item.projectId}`} className="text-indigo-600 hover:underline font-medium">
                          {item.projectName}
                        </Link>
                        ): «{getStatusLabel(item.previousValue)}» → «{getStatusLabel(item.newValue)}»
                      </>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">{item.userName}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Entregas y compromisos</h2>
          <DashboardDeliveriesSection tasksWithDue={data.tasksWithDue} noteEvents={data.noteEvents} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Proyectos</h2>
          <p className="text-gray-600 text-sm mb-4">
            Edita el proyecto o empieza a cargar los tipos de documentos que necesita.
          </p>
          {data.projects.length === 0 ? (
            <p className="text-gray-500 py-6 text-center">No hay proyectos activos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-2 font-semibold text-gray-900">Proyecto</th>
                    <th className="py-3 px-2 font-semibold text-gray-900">Cliente</th>
                    <th className="py-3 px-2 font-semibold text-gray-900">Estado</th>
                    <th className="py-3 px-2 font-semibold text-gray-900">Progreso</th>
                    <th className="py-3 px-2 font-semibold text-gray-900">Inicio / Entrega</th>
                    <th className="py-3 px-2 font-semibold text-gray-900 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.projects.map((project: {
                    _id: string;
                    name: string;
                    client: string;
                    kanbanColumn: string;
                    progress: number;
                    createdAt: Date | null;
                    maxDueDate: Date | null;
                    daysRemaining: number | null;
                  }) => (
                    <tr key={project._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-900">{project.name}</td>
                      <td className="py-3 px-2 text-gray-600">{project.client}</td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-gray-600">{project.kanbanColumn}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="w-full max-w-[8rem] bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              (project.progress ?? 0) >= 100
                                ? 'bg-green-600'
                                : (project.progress ?? 0) >= 50
                                ? 'bg-blue-600'
                                : 'bg-gray-600'
                            }`}
                            style={{ width: `${project.progress ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-0.5 block">{project.progress ?? 0}%</span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span title="Inicio del proyecto">
                            Inicio: {project.createdAt ? project.createdAt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </span>
                          <span title="Última entrega comprometida">
                            Entrega: {project.maxDueDate ? project.maxDueDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </span>
                          {project.daysRemaining !== null && (
                            <span className={project.daysRemaining < 0 ? 'text-red-600 font-medium' : project.daysRemaining <= 7 ? 'text-amber-600 font-medium' : 'text-gray-600'}>
                              {project.daysRemaining > 0
                                ? `${project.daysRemaining} día${project.daysRemaining === 1 ? '' : 's'} restante${project.daysRemaining === 1 ? '' : 's'}`
                                : project.daysRemaining === 0
                                ? 'Vence hoy'
                                : `Vencido hace ${Math.abs(project.daysRemaining)} día${Math.abs(project.daysRemaining) === 1 ? '' : 's'}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/projects/${project._id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Edit size={16} />
                            Editar
                          </Link>
                          <Link
                            href={`/projects/${project._id}#documentos`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <FileUp size={16} />
                            Cargar documentos
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
