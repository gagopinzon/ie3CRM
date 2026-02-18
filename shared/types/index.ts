// Tipos compartidos entre frontend y backend

export type UserRole = 'admin' | 'project_manager' | 'engineer' | 'viewer';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export type KanbanColumnType = 'Contacted' | 'Negotiation' | 'Offer Sent' | 'Deal Closed' | 'In Progress' | 'Completed';

export interface Project {
  _id: string;
  name: string;
  description: string;
  client: string | Client;
  status: string;
  assignedTo?: string;
  documentTypes: string[];
  kanbanColumn: KanbanColumnType;
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  canModify: UserRole[];
  canView: UserRole[];
}

export interface DocumentType {
  _id: string;
  name: string;
  description?: string;
  category?: string | Category;
  allowedFileTypes?: string[];
  requiresAddress?: boolean;
}

export interface ProjectDocument {
  _id: string;
  projectId: string;
  documentTypeId: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileSize: number;
}

export interface ProjectNote {
  _id: string;
  projectId: string;
  content: string;
  type: 'note' | 'log';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CalendarEventType = 'reminder' | 'meeting' | 'deadline';

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  projectId?: string;
  startDate: Date;
  endDate?: Date;
  reminderDate?: Date;
  createdBy: string;
  type: CalendarEventType;
}

export interface KanbanColumn {
  _id: string;
  name: KanbanColumnType;
  order: number;
  color: string;
}
