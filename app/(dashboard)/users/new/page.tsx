import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Role from '@/models/Role';
import UserForm from '@/components/users/UserForm';

async function getRoles() {
  await connectDB();
  const roles = await Role.find().sort({ name: 1 });
  return JSON.parse(JSON.stringify(roles));
}

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (!(session.user as any).permissions?.canManageUsers) {
    redirect('/dashboard');
  }

  const roles = await getRoles();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo usuario</h1>
          <p className="text-gray-600 mt-1 text-sm">Datos para que pueda iniciar sesión</p>
        </div>

        <UserForm roles={roles} />
      </div>
    </DashboardLayout>
  );
}
