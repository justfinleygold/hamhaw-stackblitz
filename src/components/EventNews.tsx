import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useEventStore } from '../stores/eventStore';
import { Loader2, ChevronRight } from 'lucide-react';

interface EventUpdate {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export function EventNews({ showAll = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<EventUpdate[]>([]);
  const selectedEventId = useEventStore((state) => state.selectedEventId);

  useEffect(() => {
    async function loadUpdates() {
      if (!selectedEventId) return;

      try {
        setLoading(true);
        const query = supabase
          .from('event_updates')
          .select('*')
          .eq('event_id', selectedEventId)
          .order('created_at', { ascending: false });

        if (!showAll) {
          query.limit(1);
        }

        const { data, error } = await query;
        if (error) throw error;
        setUpdates(data || []);
      } catch (err) {
        console.error('Error loading event updates:', err);
        setError('Failed to load event updates');
      } finally {
        setLoading(false);
      }
    }

    loadUpdates();
  }, [selectedEventId, showAll]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No updates available for this event.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Event Updates
        </h2>
        <div className="space-y-6">
          {updates.map((update) => (
            <div key={update.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {update.title}
              </h3>
              <p className="text-gray-600 mb-2">{update.content}</p>
              <p className="text-sm text-gray-500">
                {new Date(update.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        {!showAll && updates.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/event-updates')}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
            >
              Read More
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}