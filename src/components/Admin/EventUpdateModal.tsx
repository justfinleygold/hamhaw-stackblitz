import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, X } from 'lucide-react';

interface EventUpdate {
  id: string;
  event_id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
}

interface EventUpdateModalProps {
  eventId: string;
  update: EventUpdate | null;
  onClose: () => void;
  onSave: () => void;
}

export function EventUpdateModal({ eventId, update, onClose, onSave }: EventUpdateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: update?.title || '',
    content: update?.content || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (update) {
        // Update existing
        const { error } = await supabase
          .from('event_updates')
          .update({
            title: formData.title,
            content: formData.content,
          })
          .eq('id', update.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('event_updates')
          .insert({
            event_id: eventId,
            title: formData.title,
            content: formData.content,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          });

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving event update:', err);
      setError(err instanceof Error ? err.message : 'Failed to save event update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {update ? 'Edit Update' : 'New Update'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {update ? 'Save Changes' : 'Create Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}