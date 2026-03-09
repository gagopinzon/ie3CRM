import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Role from '@/models/Role';
import RolesList from '@/components/roles/RolesList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

async function getRoles() {
  await connectDB();
  const roles = await Role.find().sort({ name: 1 });
  return JSON.parse(JSON.stringify(roles));
}

export default async function RolesPage() {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
            <p className="text-gray-600 mt-2">Gestiona los roles y permisos del sistema</p>
          </div>
          <Link
            href="/roles/new"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
          >
            <Plus size={20} />
            Nuevo Rol
          </Link>
        </div>

        <RolesList initialRoles={roles} />
      </div>
    </DashboardLayout>
  );
}
