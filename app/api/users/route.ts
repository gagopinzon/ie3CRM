import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageUsers) {
      return NextResponse.json({ error: 'No autorizado. Sin permiso para gestionar usuarios' }, { status: 403 });
    }

    await connectDB();

    const users = await User.find()
      .populate('role', 'name code description permissions')
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(session.user as any).permissions?.canManageUsers) {
      return NextResponse.json({ error: 'No autorizado. Sin permiso para crear usuarios' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { email, password, name, roleId } = body;

    if (!email || !password || !name || !roleId) {
      return NextResponse.json(
        { error: 'Email, contraseña, nombre y rol son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar que el rol existe
    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json(
        { error: 'Rol no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que el email no exista
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      role: roleId,
    });

    const populatedUser = await User.findById(user._id)
      .populate('role', 'name code description permissions')
      .select('-password');

    return NextResponse.json(populatedUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
