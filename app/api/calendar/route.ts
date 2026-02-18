import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CalendarEvent from '@/models/CalendarEvent';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const projectId = searchParams.get('projectId');

    await connectDB();

    const query: any = {};

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (projectId) {
      query.projectId = projectId;
    }

    const events = await CalendarEvent.find(query)
      .populate('projectId', 'name')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });

    return NextResponse.json(events, { status: 200 });
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

    const body = await request.json();
    const { title, description, projectId, startDate, endDate, reminderDate, type } = body;

    if (!title || !startDate) {
      return NextResponse.json(
        { error: 'Título y fecha de inicio son requeridos' },
        { status: 400 }
      );
    }

    await connectDB();

    const event = await CalendarEvent.create({
      title,
      description,
      projectId: projectId || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      reminderDate: reminderDate ? new Date(reminderDate) : null,
      createdBy: (session.user as any).id,
      type: type || 'reminder',
    });

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name');

    return NextResponse.json(populatedEvent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
