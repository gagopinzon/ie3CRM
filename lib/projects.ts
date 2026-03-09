import mongoose from 'mongoose';
import Client from '@/models/Client';
import Project from '@/models/Project';
import ProjectDocument from '@/models/ProjectDocument';
import ProjectTask from '@/models/ProjectTask';

/**
 * Recalcula el progreso del proyecto según documentos cargados y tareas completadas.
 * - Documentos: % de tipos de documento requeridos que tienen al menos un archivo.
 * - Tareas: % de tareas con estado 'done'.
 * - Progreso final = promedio de ambos (50% documentos, 50% tareas).
 * Si no hay tipos de documento o no hay tareas, esa parte cuenta como 100%.
 */
export async function recalculateProjectProgress(projectId: string): Promise<void> {
  const project = await Project.findById(projectId).select('documentTypes').lean();
  if (!project) return;

  const docTypes = (project.documentTypes || []) as mongoose.Types.ObjectId[];
  const totalDocTypes = docTypes.length;

  const docs = await ProjectDocument.find({ projectId: new mongoose.Types.ObjectId(projectId) })
    .select('documentTypeId')
    .lean();
  const uploadedTypeIds = new Set(
    (docs as { documentTypeId: mongoose.Types.ObjectId }[]).map((d) => d.documentTypeId.toString())
  );
  const docTypesSet = new Set(docTypes.map((id) => id.toString()));
  const typesWithAtLeastOneDoc = [...docTypesSet].filter((id) => uploadedTypeIds.has(id)).length;

  const documentsProgress =
    totalDocTypes === 0 ? 100 : Math.round((typesWithAtLeastOneDoc / totalDocTypes) * 100);

  const tasks = await ProjectTask.find({ projectId }).lean();
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: { status: string }) => t.status === 'done').length;
  const tasksProgress = totalTasks === 0 ? 100 : Math.round((doneTasks / totalTasks) * 100);

  const progress = Math.round((documentsProgress + tasksProgress) / 2);
  await Project.findByIdAndUpdate(projectId, { progress: Math.min(100, Math.max(0, progress)) });
}

/**
 * Resuelve el valor del campo cliente a un ObjectId:
 * - Si es un ID válido y existe el cliente → lo usa
 * - Si coincide con un companyName existente → lo usa
 * - Si no existe → crea un cliente nuevo con ese nombre y un contacto mínimo
 */
export async function resolveOrCreateClientId(clientValue: string): Promise<mongoose.Types.ObjectId> {
  const trimmed = (clientValue || '').trim();
  if (!trimmed) {
    throw new Error('Cliente es requerido');
  }

  if (/^[a-fA-F0-9]{24}$/.test(trimmed)) {
    const byId = await Client.findById(trimmed);
    if (byId) return byId._id as mongoose.Types.ObjectId;
  }

  const byName = await Client.findOne({
    companyName: { $regex: new RegExp('^' + trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
    status: 'active',
  });
  if (byName) return byName._id as mongoose.Types.ObjectId;

  const newClient = await Client.create({
    companyName: trimmed,
    contacts: [{ name: trimmed, email: '', phone: '' }],
    status: 'active',
  });
  return newClient._id as mongoose.Types.ObjectId;
}
