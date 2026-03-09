import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

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

    const client = await Client.findById(params.id);

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(client, { status: 200 });
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

    if (!(session.user as any).permissions?.canManageClients) {
      return NextResponse.json({ error: 'No tienes permiso para editar clientes' }, { status: 403 });
    }

    const body = await request.json();
    const {
      companyName,
      rfc,
      address,
      city,
      state,
      zipCode,
      country,
      contactName,
      contactEmail,
      contactPhone,
      contactPosition,
      notes,
      status,
    } = body;

    await connectDB();

    const updateData: any = {
      ...(companyName && { companyName }),
      ...(rfc !== undefined && { rfc }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zipCode !== undefined && { zipCode }),
      ...(country !== undefined && { country }),
      ...(notes !== undefined && { notes }),
      ...(status && { status }),
    };

    if (contacts !== undefined) {
      const validContacts = contacts.filter((contact: any) => contact.name && contact.name.trim() !== '');
      updateData.contacts = validContacts;
    }

    const client = await Client.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(client, { status: 200 });
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

    if (!(session.user as any).permissions?.canManageClients) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar clientes' }, { status: 403 });
    }

    await connectDB();

    // Verificar si hay proyectos asociados
    const Project = (await import('@/models/Project')).default;
    const projectsCount = await Project.countDocuments({ client: params.id });

    if (projectsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el cliente porque tiene ${projectsCount} proyecto(s) asociado(s)` },
        { status: 400 }
      );
    }

    const client = await Client.findByIdAndDelete(params.id);

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
