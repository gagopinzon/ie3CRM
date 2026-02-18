import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import CalendarEvent from '@/models/CalendarEvent';
import ProjectDocument from '@/models/ProjectDocument';

async function getDashboardData() {
  await connectDB();

  const [projects, events, documents] = await Promise.all([
    Project.countDocuments({ status: 'active' }),
    CalendarEvent.countDocuments({ startDate: { $gte: new Date() } }),
    ProjectDocument.countDocuments(),
  ]);

  const projectsByStatus = await Project.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$kanbanColumn', count: { $sum: 1 } } },
  ]);

  return {
    totalProjects: projects,
    upcomingEvents: events,
    totalDocuments: documents,
    projectsByStatus: projectsByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>),
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const data = await getDashboardData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido, {session.user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Proyectos Activos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalProjects}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Eventos Próximos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.upcomingEvents}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Documentos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalDocuments}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Rol</h3>
            <p className="text-lg font-semibold text-gray-900 mt-2 capitalize">
              {session.user?.role}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Proyectos por Estado</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.projectsByStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{count}</p>
                <p className="text-sm text-gray-600 mt-1">{status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
