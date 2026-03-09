import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { 'contacts.name': { $regex: search, $options: 'i' } },
        { rfc: { $regex: search, $options: 'i' } },
      ];
    }

    const clients = await Client.find(query).sort({ companyName: 1 });

    return NextResponse.json(clients, { status: 200 });
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

    if (!(session.user as any).permissions?.canManageClients) {
      return NextResponse.json({ error: 'No tienes permiso para crear clientes' }, { status: 403 });
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

    if (!companyName || !contactName) {
      return NextResponse.json(
        { error: 'Nombre de empresa y nombre de contacto son requeridos' },
        { status: 400 }
      );
    }

    await connectDB();

    const client = await Client.create({
      companyName,
      rfc,
      address,
      city,
      state,
      zipCode,
      country: country || 'México',
      contacts: validContacts,
      notes,
      status: status || 'active',
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
