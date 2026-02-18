import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import KanbanColumn from '@/models/KanbanColumn';

async function getKanbanData() {
  try {
    await connectDB();
    
    const [columns, projects] = await Promise.all([
      KanbanColumn.find().sort({ order: 1 }),
      Project.find()
        .populate('assignedTo', 'name email')
        .populate('documentTypes', 'name')
        .sort({ createdAt: -1 }),
    ]);

    return {
      columns: JSON.parse(JSON.stringify(columns)),
      projects: JSON.parse(JSON.stringify(projects)),
    };
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    return { columns: [], projects: [] };
  }
}

export default async function KanbanPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { columns, projects } = await getKanbanData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tablero Kanban</h1>
          <p className="text-gray-600 mt-2">Gestiona tus proyectos con el tablero Kanban</p>
        </div>

        <KanbanBoard initialColumns={columns} initialProjects={projects} />
      </div>
    </DashboardLayout>
  );
}
