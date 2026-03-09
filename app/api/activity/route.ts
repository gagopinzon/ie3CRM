import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

/** GET: últimos movimientos (solo admin). */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const role = (session.user as any).role;
    const isAdmin = role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Solo administradores pueden ver la actividad' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 30, 100);

    await connectDB();
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const items = logs.map((log: any) => ({
      _id: log._id.toString(),
      type: log.type,
      projectId: log.projectId?.toString(),
      projectName: log.projectName,
      entityId: log.entityId?.toString(),
      entityTitle: log.entityTitle,
      previousValue: log.previousValue,
      newValue: log.newValue,
      userId: log.userId?.toString(),
      userName: log.userName,
      createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : null,
    }));

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
