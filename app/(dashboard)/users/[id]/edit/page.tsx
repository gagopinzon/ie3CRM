import DashboardLayout from '@/components/layout/DashboardLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import UserForm from '@/components/users/UserForm';

async function getUserData(id: string) {
  await connectDB();
  const [user, roles] = await Promise.all([
    User.findById(id).populate('role'),
    Role.find().sort({ name: 1 }),
  ]);

  if (!user) return null;

  return {
    user: JSON.parse(JSON.stringify(user)),
    roles: JSON.parse(JSON.stringify(roles)),
  };
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
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

  const data = await getUserData(params.id);

  if (!data) {
    redirect('/users');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
          <p className="text-gray-600 mt-2">Modifica la información del usuario</p>
        </div>

        <UserForm
          roles={data.roles}
          initialData={{
            _id: data.user._id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
