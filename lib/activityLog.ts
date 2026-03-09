import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

export interface LogActivityParams {
  type: 'project_status' | 'task_status';
  projectId: string;
  projectName: string;
  entityId: string;
  entityTitle?: string;
  previousValue: string;
  newValue: string;
  userId: string;
  userName: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  await connectDB();
  await ActivityLog.create({
    type: params.type,
    projectId: params.projectId,
    projectName: params.projectName,
    entityId: params.entityId,
    entityTitle: params.entityTitle,
    previousValue: params.previousValue,
    newValue: params.newValue,
    userId: params.userId,
    userName: params.userName,
  });
}
