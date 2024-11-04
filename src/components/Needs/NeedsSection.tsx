import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useEventStore } from '../../stores/eventStore';
import { Loader2, ChevronRight } from 'lucide-react';

interface Need {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

export function NeedsSection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestNeed, setLatestNeed] = useState<Need | null>(null);
  const selectedEventId = useEventStore((state) => state.selectedEventId);

  useEffect(() => {
    async function loadLatestNeed() {
      if (!selectedEventId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('needs')
          .select('*')
          .eq('event_id', selectedEventId)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setLatestNeed(data);
      } catch (err) {
        console.error('Error loading latest need:', err);
        setError('Failed to load latest need');
      } finally {
        setLoading(false);
      }
    }

    loadLatestNeed();
  }, [selectedEventId]);

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

  if (!latestNeed) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No current needs for this event.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Latest Community Need
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {latestNeed.title}
            </h3>
            <p className="mt-1 text-gray-600">{latestNeed.description}</p>
            <div className="mt-2 flex items-center space-x-4">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  latestNeed.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : latestNeed.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {latestNeed.priority} priority
              </span>
              <span className="text-sm text-gray-500">
                Posted {new Date(latestNeed.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/needs')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            View All Needs
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}