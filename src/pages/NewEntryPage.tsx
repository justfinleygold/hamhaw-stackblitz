import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { createMissingPersonWithStatus, getStatusTypes, getEventById, getProfile } from '../lib/database';
import { useEventStore } from '../stores/eventStore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { NeedModal } from '../components/Needs/NeedModal';
import { NetFields } from '../components/NetFields';

export function NewEntryPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const selectedEventId = useEventStore((state) => state.selectedEventId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusTypes, setStatusTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [currentEvent, setCurrentEvent] = useState<{ id: string; name: string; date: string } | null>(null);
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [createNeedAfterSave, setCreateNeedAfterSave] = useState(false);
  const [isHamOperator, setIsHamOperator] = useState(false);
  const [netId, setNetId] = useState<string | null>(null);
  const [frequency, setFrequency] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    lastAddress: '',
    lastCity: '',
    lastState: '',
    lastZip: '',
    lastDateTime: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (!selectedEventId) {
      navigate('/dashboard');
      return;
    }

    const loadInitialData = async () => {
      try {
        // Check if user is ham operator
        const profile = await getProfile(user.id);
        if (profile?.roles?.name) {
          setIsHamOperator(['ham', 'net_control', 'admin'].includes(profile.roles.name));
        }

        // Load status types
        const types = await getStatusTypes();
        setStatusTypes(types);

        // Load event details
        const event = await getEventById(selectedEventId);
        if (event) {
          setCurrentEvent(event);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load required data');
      }
    };

    loadInitialData();
  }, [selectedEventId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a new entry');
      return;
    }
    if (!selectedEventId) {
      setError('No event selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const missingStatus = statusTypes.find(type => type.name.toLowerCase() === 'missing');
      if (!missingStatus) {
        throw new Error('Missing status type not found');
      }

      const result = await createMissingPersonWithStatus(
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender || null,
          age: formData.age ? parseInt(formData.age, 10) : null,
          event_id: selectedEventId,
          reported_by: user.id,
          address: formData.lastAddress,
          city: formData.lastCity,
          state: formData.lastState,
          zip: formData.lastZip,
        },
        {
          last_seen_date: formData.lastDateTime,
          last_city: formData.lastCity,
          last_state: formData.lastState,
          address: formData.lastAddress,
          zip: formData.lastZip,
          notes: formData.notes,
          reported_by: user.id,
          net_id: netId,
          frequency: frequency,
        },
        missingStatus.id
      );

      if (!result) {
        throw new Error('Failed to create entry - no data returned');
      }

      if (createNeedAfterSave) {
        setIsNeedModalOpen(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error creating entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to create new entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Missing Person Entry</h1>
          {currentEvent && (
            <div className="text-sm text-gray-500">
              Event: {currentEvent.name} ({new Date(currentEvent.date).toLocaleDateString()})
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Net Information (for ham operators only) */}
          {isHamOperator && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Net Information</h2>
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

          {/* Last Known Location */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Last Known Location</h2>
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
                  value={formData.lastDateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, lastDateTime: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="createNeed"
              checked={createNeedAfterSave}
              onChange={(e) => setCreateNeedAfterSave(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="createNeed"
              className="ml-2 block text-sm text-gray-700"
            >
              Create a need at this location after saving
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
              Create Entry
            </button>
          </div>
        </form>
      </div>

      {isNeedModalOpen && selectedEventId && (
        <NeedModal
          eventId={selectedEventId}
          need={null}
          initialLocation={{
            address: formData.lastAddress,
            city: formData.lastCity,
            state: formData.lastState,
            zip: formData.lastZip,
          }}
          onClose={() => {
            setIsNeedModalOpen(false);
            navigate('/dashboard');
          }}
          onSave={() => {
            setIsNeedModalOpen(false);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
}