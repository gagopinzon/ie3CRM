import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Role from '@/models/Role';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const role = await Role.findById(params.id);

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    return NextResponse.json(role, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageUsers) {
      return NextResponse.json({ error: 'No autorizado. Sin permiso para editar roles' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { name, description, permissions } = body;

    const role = await Role.findById(params.id);

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    // No permitir editar roles del sistema (excepto descripción y permisos)
    if (role.isSystem && name && name !== role.name) {
      return NextResponse.json(
        { error: 'No se puede modificar el nombre de un rol del sistema' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined && !role.isSystem) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (permissions !== undefined) updateData.permissions = permissions;

    const updatedRole = await Role.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedRole, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageUsers) {
      return NextResponse.json({ error: 'No autorizado. Sin permiso para eliminar roles' }, { status: 403 });
    }

    await connectDB();

    const role = await Role.findById(params.id);

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    // No permitir eliminar roles del sistema
    if (role.isSystem) {
      return NextResponse.json(
        { error: 'No se puede eliminar un rol del sistema' },
        { status: 400 }
      );
    }

    // Verificar si hay usuarios usando este rol
    const usersWithRole = await User.countDocuments({ role: params.id });
    if (usersWithRole > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el rol porque ${usersWithRole} usuario(s) lo están usando` },
        { status: 400 }
      );
    }

    await Role.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Rol eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
