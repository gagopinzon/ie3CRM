import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UsersList from '@/components/users/UsersList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

async function getUsers() {
  await connectDB();
  const users = await User.find()
    .populate('role', 'name code')
    .select('-password')
    .sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (!(session.user as any).permissions?.canManageUsers) {
    redirect('/dashboard');
  }

  const users = await getUsers();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-600 mt-1 text-sm">Usuarios que pueden iniciar sesión en el sistema</p>
          </div>
          <Link
            href="/users/new"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-semibold text-sm"
          >
            <Plus size={18} />
            Nuevo usuario
          </Link>
        </div>

        <UsersList initialUsers={users} currentUserId={(session.user as any).id} />
      </div>
    </DashboardLayout>
  );
}
