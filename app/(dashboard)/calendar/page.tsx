import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CalendarComponent from '@/components/calendar/CalendarComponent';
import connectDB from '@/lib/mongodb';
import CalendarEvent from '@/models/CalendarEvent';
import Project from '@/models/Project';

async function getCalendarEvents() {
  try {
    await connectDB();
    const events = await CalendarEvent.find()
      .populate('projectId', 'name')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });
    
    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

async function getProjects() {
  try {
    await connectDB();
    const projects = await Project.find()
      .populate('assignedTo', 'name email')
      .populate('documentTypes', 'name')
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const [events, projects] = await Promise.all([getCalendarEvents(), getProjects()]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600 mt-2">Gestiona eventos, recordatorios y fechas importantes</p>
        </div>

        <CalendarComponent initialEvents={events} projects={projects} />
      </div>
    </DashboardLayout>
  );
}
