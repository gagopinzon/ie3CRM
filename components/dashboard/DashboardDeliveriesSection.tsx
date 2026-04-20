'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, AlertTriangle, ChevronRight, X, CheckCircle2, XCircle, Upload, ChevronLeft } from 'lucide-react';
import {
  getCalendarEventColors,
  getStatusBadgeClasses,
  getStatusLabel,
  getStatusRowClasses,
  getTaskCardPalette,
} from '@/lib/ui/workflowTheme';
import { localCalendarDayFromStored } from '@/lib/dateOnly';

moment.locale('es');
const localizer = momentLocalizer(moment);

export interface TaskWithDue {
  _id: string;
  title: string;
  dueDate: string;
  status: string;
  projectId: { _id: string; name: string } | string;
  assignedTo?: { _id: string; name: string }[];
  documentTypeId?: { _id: string; name: string } | null;
}

export interface NoteEvent {
  _id: string;
  content: string;
  eventDate: string;
  projectId: { _id: string; name: string } | null;
}

type CalendarResource = (TaskWithDue & { kind?: 'task' }) | (NoteEvent & { kind: 'note' });

interface DashboardDeliveriesSectionProps {
  tasksWithDue: TaskWithDue[];
  noteEvents?: NoteEvent[];
}

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'Por hacer' },
  { id: 'in_progress', title: 'En progreso' },
  { id: 'review', title: 'En revisión' },
  { id: 'done', title: 'Completado' },
] as const;

function getProjectName(p: TaskWithDue['projectId']): string {
  return typeof p === 'object' && p?.name ? p.name : '—';
}

function getProjectId(p: TaskWithDue['projectId']): string {
  return typeof p === 'object' && p?._id ? p._id : (p as string) ?? '';
}


function getAssigneesLabel(task: TaskWithDue): string {
  const list = task.assignedTo ?? [];
  if (!list.length) return 'Sin responsable';
  if (list.length === 1) return list[0].name || '—';
  if (list.length === 2) return `${list[0].name || '—'} y ${list[1].name || '—'}`;
  return `${list[0].name || '—'}, ${list[1].name || '—'} +${list.length - 2}`;
}

function isNoteEvent(r: CalendarResource | undefined): r is NoteEvent & { kind: 'note' } {
  return !!r && (r as NoteEvent & { kind: string }).kind === 'note';
}

function isPastDay(date: Date, todayStart: number): boolean {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  return dayStart.getTime() < todayStart;
}

function getOverdueDaysLabel(dueDate: string, todayStart: number): string {
  const due = localCalendarDayFromStored(dueDate);
  const diffMs = todayStart - due.getTime();
  const days = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return days === 1 ? 'Vencido hace 1 día' : `Vencido hace ${days} días`;
}

function getOverdueTypeColor(status: string): string {
  switch (status) {
    case 'todo':
      return 'text-amber-700';
    case 'in_progress':
      return 'text-sky-700';
    case 'review':
      return 'text-violet-700';
    case 'done':
      return 'text-emerald-700';
    default:
      return 'text-red-700';
  }
}

function getOverdueIconCircleClasses(status: string): string {
  switch (status) {
    case 'todo':
      return 'bg-amber-100 text-amber-700';
    case 'in_progress':
      return 'bg-sky-100 text-sky-700';
    case 'review':
      return 'bg-violet-100 text-violet-700';
    case 'done':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-red-100 text-red-700';
  }
}

function getOverdueStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'todo':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'in_progress':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'review':
      return 'bg-violet-100 text-violet-800 border-violet-200';
    case 'done':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-red-100 text-red-800 border-red-200';
  }
}

function CalendarEventContent({ event }: { event: { resource?: CalendarResource } }) {
  const resource = event.resource;
  if (!resource) return null;

  if (isNoteEvent(resource)) {
    const projectName = resource.projectId && typeof resource.projectId === 'object' ? resource.projectId.name : '—';
    const title = resource.content.length > 40 ? resource.content.slice(0, 40) + '…' : resource.content;
    return (
      <div className="text-[12px] leading-snug font-medium overflow-hidden">
        <div className="font-semibold truncate">Nota: {title}</div>
        <div className="truncate opacity-90">{projectName}</div>
      </div>
    );
  }

  const task = resource as TaskWithDue;
  const statusLabel = getStatusLabel(task.status);
  const projectName = getProjectName(task.projectId);
  const assignees = getAssigneesLabel(task);
  const subtitle = [projectName, assignees].filter(Boolean).join(' · ') || statusLabel;

  return (
    <div className="text-[12px] leading-snug font-medium overflow-hidden">
      <div className="font-semibold truncate">{task.title}</div>
      <div className="truncate opacity-90">{subtitle}</div>
    </div>
  );
}

export default function DashboardDeliveriesSection({ tasksWithDue, noteEvents = [] }: DashboardDeliveriesSectionProps) {
  const router = useRouter();
  const [modalTask, setModalTask] = useState<TaskWithDue | null>(null);
  const [movingStatus, setMovingStatus] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const { overdue, upcoming } = useMemo(() => {
    const over: TaskWithDue[] = [];
    const up: TaskWithDue[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (const t of tasksWithDue) {
      const due = localCalendarDayFromStored(t.dueDate);
      if (due.getTime() < now.getTime()) {
        if (t.status !== 'done') over.push(t);
      } else {
        up.push(t);
      }
    }
    over.sort(
      (a, b) =>
        localCalendarDayFromStored(a.dueDate).getTime() -
        localCalendarDayFromStored(b.dueDate).getTime(),
    );
    up.sort(
      (a, b) =>
        localCalendarDayFromStored(a.dueDate).getTime() -
        localCalendarDayFromStored(b.dueDate).getTime(),
    );
    return { overdue: over, upcoming: up };
  }, [tasksWithDue]);

  const calendarEvents = useMemo(() => {
    const taskItems = tasksWithDue.map((t) => {
      const d = localCalendarDayFromStored(t.dueDate);
      d.setHours(9, 0, 0, 0);
      const end = new Date(d);
      end.setHours(17, 0, 0, 0);
      return {
        id: t._id,
        title: t.title,
        start: d,
        end,
        resource: { ...t, kind: 'task' as const } as CalendarResource,
      };
    });
    const noteItems = noteEvents.map((n) => {
      const d = localCalendarDayFromStored(n.eventDate);
      d.setHours(9, 0, 0, 0);
      const end = new Date(d);
      end.setHours(17, 0, 0, 0);
      return {
        id: `note-${n._id}`,
        title: n.content.slice(0, 30) + (n.content.length > 30 ? '…' : ''),
        start: d,
        end,
        resource: { ...n, kind: 'note' as const } as CalendarResource,
      };
    });
    return [...taskItems, ...noteItems];
  }, [tasksWithDue, noteEvents]);

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const countByMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of calendarEvents) {
      const key = `${e.start.getFullYear()}-${e.start.getMonth()}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [calendarEvents]);

  const prevMonthStart = useMemo(() => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() - 1);
    return d;
  }, [viewMonth]);

  const nextMonthStart = useMemo(() => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [viewMonth]);

  const countPrev = countByMonth[`${prevMonthStart.getFullYear()}-${prevMonthStart.getMonth()}`] ?? 0;
  const countNext = countByMonth[`${nextMonthStart.getFullYear()}-${nextMonthStart.getMonth()}`] ?? 0;

  const isToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon size={22} className="text-gray-700" />
            Entregas por fecha de compromiso
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Un mes a la vez · Navega con las flechas · Hoy resaltado
          </p>
        </div>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-semibold text-gray-900 capitalize min-w-[180px] text-center">
                {moment(viewMonth).format('MMMM YYYY')}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                aria-label="Mes siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {countPrev > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
                  <ChevronLeft size={14} className="text-gray-500" />
                  {countPrev} en {moment(prevMonthStart).format('MMMM')}
                </span>
              )}
              {countNext > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
                  {countNext} en {moment(nextMonthStart).format('MMMM')}
                  <ChevronRight size={14} className="text-gray-500" />
                </span>
              )}
            </div>
          </div>
          <div className="w-full" style={{ minHeight: 640 }}>
            <Calendar
              localizer={localizer}
              culture="es"
              date={viewMonth}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view="month"
              views={['month']}
              style={{ width: '100%', height: 640 }}
              toolbar={false}
              components={{
                event: CalendarEventContent,
                month: {
                  dateHeader: ({ date: d, label }: { date: Date; label: string }) => {
                    const past = isPastDay(d, todayStart);
                    const today = isToday(d);
                    return (
                      <span
                        className={
                          today ? 'font-bold text-blue-700 bg-blue-100 rounded-full w-7 h-7 inline-flex items-center justify-center' :
                          past ? 'line-through text-gray-400' : ''
                        }
                      >
                        {label}
                      </span>
                    );
                  },
                },
              }}
              dayPropGetter={(d) => {
                const past = isPastDay(d, todayStart);
                const today = isToday(d);
                return {
                  className: today ? 'rbc-day-today' : past ? 'rbc-day-past' : '',
                };
              }}
              eventPropGetter={(event) => {
                const resource = (event as { resource?: CalendarResource }).resource;
                if (isNoteEvent(resource)) {
                  const colors = getCalendarEventColors('', true);
                  return {
                    style: {
                      backgroundColor: colors.backgroundColor,
                      borderRadius: '8px',
                      color: colors.color,
                      border: `1px solid ${colors.borderColor}`,
                      fontSize: '12px',
                    },
                  };
                }
                const task = resource as TaskWithDue | undefined;
                const status = task?.status ?? '';
                const colors = getCalendarEventColors(status);
                return {
                  style: {
                    backgroundColor: colors.backgroundColor,
                    borderRadius: '8px',
                    color: colors.color,
                    border: `1px solid ${colors.borderColor}`,
                    fontSize: '12px',
                  },
                };
              }}
              messages={{
                noEventsInRange: 'Sin entregas',
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vencidas - warning fuerte */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={22} className="text-gray-700 shrink-0" />
              Entregas vencidas
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {overdue.length === 0
                ? 'No hay actividades vencidas'
                : `${overdue.length} actividad(es) pasada(s) la fecha de compromiso`}
            </p>
          </div>
          <div className="p-4 max-h-[320px] overflow-y-auto">
            {overdue.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Todo al día</p>
            ) : (
              <ul className="space-y-2">
                {overdue.map((t) => (
                  <li key={t._id}>
                    {(() => {
                      const palette = getTaskCardPalette(t.status);
                      const overdueColor = getOverdueTypeColor(t.status);
                      const overdueIconCircle = getOverdueIconCircleClasses(t.status);
                      return (
                    <button
                      type="button"
                      onClick={() => { setUploadFile(null); setModalTask(t); }}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all group text-left ${palette.card} shadow-[0_2px_10px_rgba(30,21,42,0.06)] hover:shadow-[0_6px_18px_rgba(30,21,42,0.12)]`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${overdueIconCircle}`}>
                        <AlertTriangle size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center gap-2 mb-1 rounded-lg px-2 py-1 ${getStatusRowClasses(t.status)}`}>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold border ${getOverdueStatusBadgeClasses(
                              t.status,
                            )}`}
                          >
                            {getStatusLabel(t.status)}
                          </span>
                          <p className="font-semibold text-gray-900 truncate">{t.title}</p>
                        </div>
                        <p className="text-sm mt-0.5 font-semibold text-[#1e152a]">
                          {getProjectName(t.projectId)} ·{' '}
                          <span className={overdueColor}>{getOverdueDaysLabel(t.dueDate, todayStart)}</span>
                        </p>
                        <p className="text-sm mt-0.5 font-semibold text-[#1e152a]">
                          Responsables: {getAssigneesLabel(t)}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 shrink-0" />
                    </button>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Modal: mover tarea vencida a columna del Kanban */}
        {modalTask && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => { if (!movingStatus && !uploadingDoc) { setModalTask(null); setUploadFile(null); } }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 id="modal-title" className="text-lg font-bold text-gray-900">
                  Mover al tablero Kanban
                </h3>
                <button
                  type="button"
                  onClick={() => { if (!movingStatus && !uploadingDoc) { setModalTask(null); setUploadFile(null); } }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-1 truncate">
                <span className="font-semibold">{modalTask.title}</span>
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {getProjectName(modalTask.projectId)} · Actualmente: {getStatusLabel(modalTask.status)}
              </p>
              <p className="text-sm font-medium text-gray-700 mb-3">¿A qué columna lo mueves?</p>
              <div className="flex flex-col gap-2">
                {KANBAN_COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    disabled={movingStatus || modalTask.status === col.id}
                    onClick={async () => {
                      setMovingStatus(true);
                      try {
                        const projectId = getProjectId(modalTask.projectId);
                        const res = await fetch(`/api/projects/${projectId}/tasks/${modalTask._id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: col.id }),
                        });
                        if (res.ok) {
                          setModalTask(null);
                          setToast({ type: 'success', message: 'Listo. La tarea se movió correctamente.' });
                          router.refresh();
                        } else {
                          const data = await res.json();
                          setToast({ type: 'error', message: data.error || 'No se pudo mover la tarea.' });
                        }
                      } catch (e) {
                        setToast({ type: 'error', message: 'Error de conexión. No se pudo mover la tarea.' });
                      } finally {
                        setMovingStatus(false);
                      }
                    }}
                    className={`px-4 py-3 rounded-xl text-left font-medium text-sm transition-colors ${
                      modalTask.status === col.id
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } ${movingStatus ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {col.title}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Si la mueves a <strong>Completado</strong>, dejará de aparecer en entregas vencidas.
              </p>

              {modalTask.documentTypeId && (
                <>
                  <div className="border-t border-gray-200 my-5 pt-5">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Upload size={18} className="text-gray-600" />
                      Subir documento
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Este paso corresponde al tipo de documento <strong>{modalTask.documentTypeId.name}</strong>. Sube el archivo aquí o en el proyecto.
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/jpeg,image/png"
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                    />
                    <button
                      type="button"
                      disabled={!uploadFile || uploadingDoc}
                      onClick={async () => {
                        if (!uploadFile) return;
                        setUploadingDoc(true);
                        try {
                          const formData = new FormData();
                          formData.append('file', uploadFile);
                          formData.append('projectId', getProjectId(modalTask.projectId));
                          formData.append('documentTypeId', modalTask.documentTypeId!._id);
                          const res = await fetch('/api/documents/upload', { method: 'POST', body: formData });
                          if (res.ok) {
                            setToast({ type: 'success', message: 'Documento subido correctamente.' });
                            setUploadFile(null);
                            router.refresh();
                          } else {
                            const data = await res.json();
                            setToast({ type: 'error', message: data.error || 'No se pudo subir el documento.' });
                          }
                        } catch (e) {
                          setToast({ type: 'error', message: 'Error de conexión al subir.' });
                        } finally {
                          setUploadingDoc(false);
                        }
                      }}
                      className="mt-2 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploadingDoc ? 'Subiendo...' : 'Subir documento'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Notificación toast: éxito o error al mover */}
        {toast && (
          <div
            role="alert"
            className={`fixed bottom-6 right-6 z-[100] flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500 border-emerald-600 text-white'
                : 'bg-red-500 border-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={28} className="shrink-0" strokeWidth={2.5} />
            ) : (
              <XCircle size={28} className="shrink-0" strokeWidth={2.5} />
            )}
            <p className="font-bold text-base">{toast.message}</p>
          </div>
        )}

        {/* Próximas por entregar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Próximas por entregar</h2>
            <p className="text-sm text-gray-500 mt-1">
              {upcoming.length === 0
                ? 'No hay entregas programadas'
                : `Las más cercanas primero (${upcoming.length} en total)`}
            </p>
          </div>
          <div className="p-4 max-h-[320px] overflow-y-auto">
            {upcoming.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Sin entregas próximas</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((t) => {
                  const dueStart = localCalendarDayFromStored(t.dueDate);
                  const isToday = dueStart.getTime() === todayStart;
                  const palette = getTaskCardPalette(t.status);
                  const upcomingColor = getOverdueTypeColor(t.status);
                  const upcomingIconCircle = getOverdueIconCircleClasses(t.status);
                  return (
                    <li key={t._id}>
                      <button
                        type="button"
                        onClick={() => { setUploadFile(null); setModalTask(t); }}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all group text-left ${palette.card} shadow-[0_2px_10px_rgba(30,21,42,0.06)] hover:shadow-[0_6px_18px_rgba(30,21,42,0.12)]`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${upcomingIconCircle} ${
                            isToday ? 'ring-2 ring-amber-300' : ''
                          }`}
                        >
                          {dueStart.getDate()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center gap-2 mb-1 rounded-lg px-2 py-1 ${getStatusRowClasses(t.status)}`}>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold border ${getOverdueStatusBadgeClasses(
                                t.status,
                              )}`}
                            >
                              {getStatusLabel(t.status)}
                            </span>
                            <p className="font-semibold text-gray-900 truncate">{t.title}</p>
                          </div>
                          <p className="text-sm mt-0.5 font-semibold text-[#1e152a]">
                            {getProjectName(t.projectId)} ·{' '}
                            <span className={upcomingColor}>
                              {isToday
                                ? 'Hoy'
                                : localCalendarDayFromStored(t.dueDate).toLocaleDateString('es-ES', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                            </span>
                          </p>
                          <p className="text-sm mt-0.5 font-semibold text-[#1e152a]">
                            Responsables: {getAssigneesLabel(t)}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        /* Colores más fuertes para nombres de días y números en el calendario */
        .rbc-month-view .rbc-header {
          color: #111827; /* gray-900 */
          font-weight: 600;
        }
        .rbc-month-view .rbc-date-cell {
          color: #111827; /* gray-900 */
          font-weight: 500;
        }
        /* Días pasados en la vista mensual */
        .rbc-month-view .rbc-day-bg.rbc-day-past {
          background-color: #f9fafb; /* gray-50 */
        }
        /* Hoy muy visible */
        .rbc-month-view .rbc-day-bg.rbc-day-today,
        .rbc-month-view .rbc-day-bg.rbc-today {
          background-color: #eff6ff !important; /* blue-50 */
          box-shadow: inset 0 0 0 2px #2563eb; /* blue-600 ring */
        }
        .rbc-month-view .rbc-date-cell.rbc-now {
          font-weight: 800;
        }
        /* Días fuera de rango un poco atenuados pero legibles */
        .rbc-off-range .rbc-date-cell {
          color: #9ca3af; /* gray-400 */
        }
        /* Eventos del mes: compactos para que quepan varios por día */
        .rbc-month-view .rbc-event {
          min-height: 2rem;
          padding: 2px 6px;
          overflow: hidden;
        }
        .rbc-month-view .rbc-event .rbc-event-content {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
