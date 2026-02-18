import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ProjectsList from '@/components/projects/ProjectsList';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

async function getProjects() {
  try {
    await connectDB();
    const projects = await Project.find()
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name')
      .populate('client', 'companyName rfc')
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const projects = await getProjects();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
            <p className="text-gray-600 mt-2">Gestiona todos tus proyectos de ingeniería</p>
          </div>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Nuevo Proyecto
          </Link>
        </div>

        <ProjectsList initialProjects={projects} />
      </div>
    </DashboardLayout>
  );
}
