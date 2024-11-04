import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, X } from 'lucide-react';

interface Net {
  id: string;
  name: string;
  description: string | null;
  frequency: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  recurring_every: string | null;
}

interface NetModalProps {
  net: Net | null;
  onClose: () => void;
  onSave: () => void;
}

export function NetModal({ net, onClose, onSave }: NetModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: net?.name || '',
    description: net?.description || '',
    frequency: net?.frequency || '',
    start_datetime: net?.start_datetime ? new Date(net.start_datetime).toISOString().slice(0, 16) : '',
    end_datetime: net?.end_datetime ? new Date(net.end_datetime).toISOString().slice(0, 16) : '',
    recurring_every: net?.recurring_every || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (net) {
        // Update existing net
        const { error } = await supabase
          .from('nets')
          .update({
            name: formData.name,
            description: formData.description || null,
            frequency: formData.frequency || null,
            start_datetime: formData.start_datetime || null,
            end_datetime: formData.end_datetime || null,
            recurring_every: formData.recurring_every || null
          })
          .eq('id', net.id);

        if (error) throw error;
      } else {
        // Create new net
        const { error } = await supabase
          .from('nets')
          .insert({
            name: formData.name,
            description: formData.description || null,
            frequency: formData.frequency || null,
            start_datetime: formData.start_datetime || null,
            end_datetime: formData.end_datetime || null,
            recurring_every: formData.recurring_every || null
          });

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving net:', err);
      setError(err instanceof Error ? err.message : 'Failed to save net');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {net ? 'Edit Net' : 'New Net'}
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
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Frequency
            </label>
            <input
              type="text"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., 146.520 MHz"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date/Time
              </label>
              <input
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date/Time
              </label>
              <input
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recurring Every
            </label>
            <select
              value={formData.recurring_every}
              onChange={(e) => setFormData({ ...formData, recurring_every: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Not Recurring</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
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
              {net ? 'Save Changes' : 'Create Net'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}