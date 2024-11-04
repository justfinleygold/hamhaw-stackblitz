import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getEvents } from '../lib/database';
import { useEventStore } from '../stores/eventStore';
import { Calendar } from 'lucide-react';

export function EventSelector() {
  const [events, setEvents] = useState<Array<{ id: string; name: string; date: string }>>([]);
  const selectedEventId = useEventStore((state) => state.selectedEventId);
  const setSelectedEventId = useEventStore((state) => state.setSelectedEventId);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    async function loadEvents() {
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);
        if (eventsData.length > 0 && !selectedEventId) {
          setSelectedEventId(eventsData[0].id);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    }

    loadEvents();
  }, [setSelectedEventId, selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  if (!events.length) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">
              {isLandingPage ? 'Emergency Event:' : 'Current Event:'}
            </span>
          {isLandingPage ? (
            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="block w-full sm:w-auto max-w-md rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} - {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          ) : (
            selectedEvent && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">
                  {selectedEvent.name}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </span>
              </div>
            )
          )}
          </div>
        </div>
      </div>
    </div>
  );
}