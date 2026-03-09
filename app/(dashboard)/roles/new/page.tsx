import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RoleForm from '@/components/roles/RoleForm';

export default async function NewRolePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (!(session.user as any).permissions?.canManageUsers) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Rol</h1>
          <p className="text-gray-600 mt-2">Crea un rol y define sus permisos</p>
        </div>

        <RoleForm />
      </div>
    </DashboardLayout>
  );
}
