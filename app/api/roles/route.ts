import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Role from '@/models/Role';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const roles = await Role.find().sort({ name: 1 });

    return NextResponse.json(roles, { status: 200 });
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
      return NextResponse.json({ error: 'No autorizado. Sin permiso para crear roles' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, description, permissions } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Nombre y código del rol son requeridos' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar que el código no exista
    const existingRole = await Role.findOne({ code: code.toLowerCase() });
    if (existingRole) {
      return NextResponse.json(
        { error: 'Ya existe un rol con ese código' },
        { status: 400 }
      );
    }

    const role = await Role.create({
      name: name.trim(),
      code: code.toLowerCase().trim(),
      description: description?.trim(),
      permissions: permissions || {
        canManageUsers: false,
        canManageProjects: true,
        canManageClients: true,
        canManageDocuments: true,
        canManageCategories: false,
        canManageDocumentTypes: true,
        canViewAllProjects: true,
        canEditAllProjects: false,
      },
      isSystem: false,
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
