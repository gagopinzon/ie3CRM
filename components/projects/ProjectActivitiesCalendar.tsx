'use client';

import { useMemo } from 'react';
import { localCalendarDayFromStored } from '@/lib/dateOnly';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getCalendarEventColors, getStatusLabel } from '@/lib/ui/workflowTheme';

moment.locale('es');
const localizer = momentLocalizer(moment);

export interface ProjectTaskForCalendar {
  _id: string;
  title: string;
  dueDate?: string | Date | null;
  status: string;
  assignedTo?: { _id: string; name: string }[] | { _id: string; name: string };
}

export interface ProjectNoteForCalendar {
  _id: string;
  content: string;
  eventDate?: string | Date | null;
}

type CalendarItem = (ProjectTaskForCalendar & { kind: 'task' }) | (ProjectNoteForCalendar & { kind: 'note'; eventDate?: string | Date | null });

interface ProjectActivitiesCalendarProps {
  tasks: ProjectTaskForCalendar[];
  notes?: ProjectNoteForCalendar[];
}

function getAssigneesLabel(task: ProjectTaskForCalendar): string {
  const raw = task.assignedTo;
  if (!raw) return 'Sin responsable';
  const list = Array.isArray(raw) ? raw : [raw];
  const names = list.map((u) => (typeof u === 'object' && u?.name ? u.name : '—')).filter(Boolean);
  if (!names.length) return 'Sin responsable';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names[0]}, ${names[1]} +${names.length - 2}`;
}

function isNote(r: CalendarItem | undefined): r is Extract<CalendarItem, { kind: 'note' }> {
  return !!r && (r as { kind: string }).kind === 'note';
}

function isPastDay(date: Date, todayStart: number): boolean {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  return dayStart.getTime() < todayStart;
}

function EventContent({ event }: { event: { resource?: CalendarItem } }) {
  const resource = event.resource;
  if (!resource) return null;

  if (isNote(resource)) {
    const title = resource.content.length > 50 ? resource.content.slice(0, 50) + '…' : resource.content;
    return (
      <div className="text-[12px] leading-tight font-medium">
        <div className="font-semibold truncate">Nota: {title}</div>
      </div>
    );
  }

  const task = resource;
  const statusLabel = getStatusLabel(task.status);
  const assignees = getAssigneesLabel(task);

  return (
    <div className="text-[12px] leading-tight font-medium">
      <div className="font-semibold truncate">{task.title}</div>
      <div className="truncate opacity-80">
        {assignees} · {statusLabel}
      </div>
    </div>
  );
}

export default function ProjectActivitiesCalendar({ tasks, notes = [] }: ProjectActivitiesCalendarProps) {
  const tasksWithDue = useMemo(
    () =>
      (tasks || []).filter((t) => {
        const d = t.dueDate;
        return d != null && (typeof d === 'string' ? d : d instanceof Date ? true : false);
      }),
    [tasks],
  );

  const notesWithDate = useMemo(
    () =>
      (notes || []).filter((n) => {
        const d = n.eventDate;
        return d != null && (typeof d === 'string' ? d : d instanceof Date ? true : false);
      }),
    [notes],
  );

  const calendarEvents = useMemo(() => {
    const taskEvents = tasksWithDue.map((t) => {
      const d = localCalendarDayFromStored(t.dueDate as string | Date);
      d.setHours(9, 0, 0, 0);
      const end = new Date(d);
      end.setHours(17, 0, 0, 0);
      return {
        id: t._id,
        title: t.title,
        start: d,
        end,
        resource: { ...t, kind: 'task' as const } as CalendarItem,
      };
    });
    const noteEvents = notesWithDate.map((n) => {
      const d = localCalendarDayFromStored(n.eventDate as string | Date);
      d.setHours(9, 0, 0, 0);
      const end = new Date(d);
      end.setHours(17, 0, 0, 0);
      return {
        id: `note-${n._id}`,
        title: n.content.slice(0, 30) + (n.content.length > 30 ? '…' : ''),
        start: d,
        end,
        resource: { ...n, kind: 'note' as const, eventDate: n.eventDate } as CalendarItem,
      };
    });
    return [...taskEvents, ...noteEvents];
  }, [tasksWithDue, notesWithDate]);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  return (
    <div className="h-[360px] sm:h-[420px]">
      <Calendar
        localizer={localizer}
        culture="es"
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        view="month"
        views={['month']}
        style={{ height: '100%', width: '100%' }}
        components={{
          event: EventContent,
          month: {
            dateHeader: ({ date, label }) => (
              <span className={isPastDay(date, todayStart) ? 'line-through text-gray-400' : ''}>{label}</span>
            ),
          },
        }}
        dayPropGetter={(date) => ({
          className: isPastDay(date, todayStart) ? 'rbc-day-past' : '',
        })}
        eventPropGetter={(event) => {
          const resource = event.resource as CalendarItem | undefined;
          if (isNote(resource)) {
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
          const task = resource as ProjectTaskForCalendar | undefined;
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
          next: 'Siguiente',
          previous: 'Anterior',
          today: 'Hoy',
          month: 'Mes',
          date: 'Fecha',
          noEventsInRange: 'No hay actividades con fecha en este rango',
        }}
      />
      <style jsx global>{`
        .rbc-month-view .rbc-header {
          color: #111827;
          font-weight: 600;
        }
        .rbc-month-view .rbc-date-cell {
          color: #111827;
          font-weight: 500;
        }
        .rbc-month-view .rbc-day-bg.rbc-day-past {
          background-color: #f9fafb;
        }
        .rbc-off-range .rbc-date-cell {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
