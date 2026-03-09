import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import bcrypt from 'bcryptjs';

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

    const user = await User.findById(params.id)
      .populate('role', 'name code description permissions')
      .select('-password');

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
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
      return NextResponse.json({ error: 'No autorizado. Sin permiso para editar usuarios' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { email, password, name, roleId } = body;

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const updateData: any = {};
    
    if (email !== undefined) {
      // Verificar que el email no esté en uso por otro usuario
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: params.id } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'El email ya está en uso por otro usuario' },
          { status: 400 }
        );
      }
      updateData.email = email.toLowerCase().trim();
    }

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (roleId !== undefined) {
      // Verificar que el rol existe
      const role = await Role.findById(roleId);
      if (!role) {
        return NextResponse.json(
          { error: 'Rol no encontrado' },
          { status: 400 }
        );
      }
      updateData.role = roleId;
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'La contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('role', 'name code description permissions')
      .select('-password');

    return NextResponse.json(updatedUser, { status: 200 });
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

    await connectDB();

    if (!(session.user as any).permissions?.canManageUsers) {
      return NextResponse.json({ error: 'No autorizado. Sin permiso para eliminar usuarios' }, { status: 403 });
    }

    // No permitir eliminarse a sí mismo
    if (params.id === (session.user as any).id) {
      return NextResponse.json(
        { error: 'No puedes eliminarte a ti mismo' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
