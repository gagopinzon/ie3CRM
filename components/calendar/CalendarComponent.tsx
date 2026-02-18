'use client';

import { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent, Project } from '@/shared/types';
import { Plus } from 'lucide-react';
import EventModal from './EventModal';

const localizer = momentLocalizer(moment);

interface CalendarComponentProps {
  initialEvents: CalendarEvent[];
  projects: Project[];
}

export default function CalendarComponent({ initialEvents, projects }: CalendarComponentProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<View>('month');

  const calendarEvents = useMemo(() => {
    return events.map((event) => ({
      id: event._id,
      title: event.title,
      start: new Date(event.startDate),
      end: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
      resource: event,
    }));
  }, [events]);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setShowModal(true);
  };

  const handleEventSaved = (newEvent: CalendarEvent) => {
    if (selectedEvent) {
      setEvents(events.map((e) => (e._id === newEvent._id ? newEvent : e)));
    } else {
      setEvents([...events, newEvent]);
    }
    setShowModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleEventDeleted = (eventId: string) => {
    setEvents(events.filter((e) => e._id !== eventId));
    setShowModal(false);
    setSelectedEvent(null);
  };

  const eventStyleGetter = (event: any) => {
    const type = event.resource?.type;
    let backgroundColor = '#3174ad';

    if (type === 'meeting') backgroundColor = '#7cb342';
    else if (type === 'deadline') backgroundColor = '#e53935';
    else if (type === 'reminder') backgroundColor = '#ffb300';

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Eventos del Calendario</h2>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setSelectedEvent(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Nuevo Evento
        </button>
      </div>

      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          view={currentView}
          onView={setCurrentView}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
          }}
        />
      </div>

      {showModal && (
        <EventModal
          event={selectedEvent}
          initialDate={selectedDate}
          projects={projects}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
            setSelectedDate(null);
          }}
          onSave={handleEventSaved}
          onDelete={handleEventDeleted}
        />
      )}
    </div>
  );
}
