import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { createStatusUpdate, updateMissingPerson, getStatusTypes, getMissingPersonById, getProfile } from '../lib/database';
import { Loader2, X } from 'lucide-react';
import { NetFields } from './NetFields';
import { supabase } from '../lib/supabase';

interface StatusUpdate {
  id: string;
  status_id: string;
  last_city: string;
  last_state: string;
  last_seen_date: string;
  notes: string;
  case_closed: boolean;
  address: string;
  zip: string;
  net_id: string | null;
  frequency: string | null;
}

interface NewStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  eventId: string | null;
  statusUpdate?: StatusUpdate | null;
  onStatusUpdate: () => void;
}

export function NewStatusUpdateModal({
  isOpen,
  onClose,
  personId,
  eventId,
  statusUpdate,
  onStatusUpdate,
}: NewStatusUpdateModalProps) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHamOperator, setIsHamOperator] = useState(false);
  const [netId, setNetId] = useState<string | null>(null);
  const [frequency, setFrequency] = useState('');
  const [statusTypes, setStatusTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    statusId: '',
    lastAddress: '',
    lastCity: '',
    lastState: '',
    lastZip: '',
    lastSeenDate: new Date().toISOString().slice(0, 16),
    notes: '',
    caseClosed: false,
  });

  useEffect(() => {
    if (!isOpen || !user) return;

    const loadData = async () => {
      try {
        // Check if user is ham operator
        const profile = await getProfile(user.id);
        if (profile?.roles?.name) {
          setIsHamOperator(['ham', 'net_control', 'admin'].includes(profile.roles.name));
        }

        // Load status types
        const types = await getStatusTypes();
        setStatusTypes(types);

        // If editing an existing update, populate the form
        if (statusUpdate) {
          setFormData({
            statusId: statusUpdate.status_id,
            lastAddress: statusUpdate.address || '',
            lastCity: statusUpdate.last_city || '',
            lastState: statusUpdate.last_state || '',
            lastZip: statusUpdate.zip || '',
            lastSeenDate: new Date(statusUpdate.last_seen_date).toISOString().slice(0, 16),
            notes: statusUpdate.notes || '',
            caseClosed: statusUpdate.case_closed,
          });
          setNetId(statusUpdate.net_id);
          setFrequency(statusUpdate.frequency || '');
        } else {
          // Load person details to get the latest status update
          const person = await getMissingPersonById(personId);
          
          if (person.status_updates && person.status_updates.length > 0) {
            // Get the most recent status update
            const latestUpdate = person.status_updates[0];
            
            setFormData({
              statusId: latestUpdate.status_id,
              lastAddress: latestUpdate.address || '',
              lastCity: latestUpdate.last_city || '',
              lastState: latestUpdate.last_state || '',
              lastZip: latestUpdate.zip || '',
              lastSeenDate: new Date().toISOString().slice(0, 16),
              notes: '',
              caseClosed: latestUpdate.case_closed,
            });
          } else {
            // No previous updates, set default values
            const missingStatus = types.find(t => t.name.toLowerCase() === 'missing');
            setFormData({
              statusId: missingStatus?.id || '',
              lastAddress: '',
              lastCity: '',
              lastState: '',
              lastZip: '',
              lastSeenDate: new Date().toISOString().slice(0, 16),
              notes: '',
              caseClosed: false,
            });
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load required data');
      }
    };

    loadData();
  }, [isOpen, personId, user, statusUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a status update');
      return;
    }

    if (!formData.statusId) {
      setError('Please select a status');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (statusUpdate) {
        // Update existing status update
        const { error } = await supabase
          .from('status_updates')
          .update({
            status_id: formData.statusId,
            last_city: formData.lastCity,
            last_state: formData.lastState,
            address: formData.lastAddress,
            zip: formData.lastZip,
            last_seen_date: formData.lastSeenDate,
            notes: formData.notes,
            case_closed: formData.caseClosed,
            net_id: netId,
            frequency: frequency,
          })
          .eq('id', statusUpdate.id);

        if (error) throw error;
      } else {
        // Create new status update
        const statusUpdate = await createStatusUpdate({
          person_id: personId,
          status_id: formData.statusId,
          last_city: formData.lastCity,
          last_state: formData.lastState,
          address: formData.lastAddress,
          zip: formData.lastZip,
          last_seen_date: formData.lastSeenDate,
          notes: formData.notes,
          case_closed: formData.caseClosed,
          reported_by: user.id,
          net_id: netId,
          frequency: frequency,
        });

        if (!statusUpdate) {
          throw new Error('Failed to create status update');
        }
      }

      // Update the person's current status
      await updateMissingPerson(personId, {
        current_status_id: formData.statusId,
        case_closed: formData.caseClosed,
      });

      onStatusUpdate();
      onClose();
    } catch (err) {
      console.error('Error saving status update:', err);
      setError(err instanceof Error ? err.message : 'Failed to save status update');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {statusUpdate ? 'Edit Status Update' : 'New Status Update'}
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
              Status *
            </label>
            <select
              value={formData.statusId}
              onChange={(e) =>
                setFormData({ ...formData, statusId: e.target.value })
              }
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Status</option>
              {statusTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                value={formData.lastAddress}
                onChange={(e) =>
                  setFormData({ ...formData, lastAddress: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.lastCity}
                onChange={(e) =>
                  setFormData({ ...formData, lastCity: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.lastState}
                onChange={(e) =>
                  setFormData({ ...formData, lastState: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.lastZip}
                onChange={(e) =>
                  setFormData({ ...formData, lastZip: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Seen Date/Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.lastSeenDate}
                onChange={(e) =>
                  setFormData({ ...formData, lastSeenDate: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {isHamOperator && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Net Information</h3>
              <NetFields
                onNetChange={(id, freq) => {
                  setNetId(id);
                  setFrequency(freq);
                }}
                frequency={frequency}
                setFrequency={setFrequency}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes *
            </label>
            <textarea
              required
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Provide details about this status update..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="caseClosed"
              checked={formData.caseClosed}
              onChange={(e) =>
                setFormData({ ...formData, caseClosed: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="caseClosed"
              className="ml-2 block text-sm text-gray-700"
            >
              Close this case
            </label>
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
              {statusUpdate ? 'Save Changes' : 'Create Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}