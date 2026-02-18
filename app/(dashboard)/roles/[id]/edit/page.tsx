import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import RoleForm from '@/components/roles/RoleForm';

async function getRoleData(id: string) {
  await connectDB();
  const role = await Role.findById(id);

  if (!role) return null;

  return JSON.parse(JSON.stringify(role));
}

export default async function EditRolePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Verificar permisos
  await connectDB();
  const currentUser = await User.findById((session.user as any).id).populate('role');
  const userRole = currentUser && typeof (currentUser as any).role === 'object' ? (currentUser as any).role : null;
  
  if (!userRole || !(userRole as any).permissions?.canManageUsers) {
    redirect('/dashboard');
  }

  const role = await getRoleData(params.id);

  if (!role) {
    redirect('/roles');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Rol</h1>
          <p className="text-gray-600 mt-2">Modifica los permisos del rol</p>
        </div>

        <RoleForm initialData={role} />
      </div>
    </DashboardLayout>
  );
}
