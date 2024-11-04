import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getMissingPersonById, getProfile } from '../lib/database';
import { useEventStore } from '../stores/eventStore';
import { Loader2, ArrowLeft, MapPin } from 'lucide-react';
import { StatusUpdateActions } from '../components/StatusUpdateActions';
import { NewStatusUpdateModal } from '../components/NewStatusUpdateModal';

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
  created_at: string;
  status_types: {
    name: string;
  };
}

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  age: number | null;
  event_id: string;
  case_closed: boolean;
  address: string;
  city: string;
  state: string;
  zip: string;
  status_types: {
    name: string;
  } | null;
  status_updates: StatusUpdate[];
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'missing':
      return 'bg-red-100 text-red-800';
    case 'investigating':
      return 'bg-yellow-100 text-yellow-800';
    case 'minor injury':
      return 'bg-orange-100 text-orange-800';
    case 'major injury':
      return 'bg-red-100 text-red-800';
    case 'deceased':
      return 'bg-gray-100 text-gray-800';
    case 'disregard':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function PersonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const selectedEventId = useEventStore((state) => state.selectedEventId);
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingStatusUpdate, setEditingStatusUpdate] = useState<StatusUpdate | null>(null);
  const [canManageUpdates, setCanManageUpdates] = useState(false);

  const loadPersonData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getMissingPersonById(id);
      
      // Sort status updates by created_at in descending order (newest first)
      if (data.status_updates) {
        data.status_updates.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      
      setPerson(data);
    } catch (err) {
      console.error('Error loading person:', err);
      setError('Failed to load person details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadPersonData();

      // Check user permissions
      if (user) {
        const profile = await getProfile(user.id);
        if (profile?.roles?.name) {
          setCanManageUpdates(['admin', 'ham', 'net_control'].includes(profile.roles.name));
        }
      }
    };

    loadData();
  }, [id, user]);

  const handleStatusUpdateDelete = async () => {
    await loadPersonData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || 'Person not found'}
        </div>
      </div>
    );
  }

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
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {person.first_name} {person.last_name}
            </h1>
            <p className="text-sm text-gray-500">
              Reported by: {person.profiles.first_name} {person.profiles.last_name}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                person.case_closed
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {person.case_closed ? 'Case Closed' : 'Active'}
            </span>
            <span className="text-sm text-gray-500 mt-1">
              Current Status:{' '}
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                person.status_types?.name ? getStatusColor(person.status_types.name) : 'bg-gray-100 text-gray-800'
              }`}>
                {person.status_types?.name || 'Unknown'}
              </span>
            </span>
          </div>
        </div>

        {/* Person Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Gender</h3>
            <p className="mt-1 text-sm text-gray-900">{person.gender || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Age</h3>
            <p className="mt-1 text-sm text-gray-900">{person.age || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Known Address</h3>
            <p className="mt-1 text-sm text-gray-900">
              {person.address ? (
                <>
                  {person.address}<br />
                  {person.city}, {person.state} {person.zip}
                </>
              ) : (
                'Not specified'
              )}
            </p>
          </div>
        </div>

        {/* Status Updates Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Status Updates</h2>
            {user && !person.case_closed && (
              <button
                onClick={() => {
                  setEditingStatusUpdate(null);
                  setIsStatusModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                New Status Update
              </button>
            )}
          </div>

          {person.status_updates.length > 0 ? (
            <div className="space-y-4">
              {person.status_updates.map((update) => (
                <div
                  key={update.id}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-2 flex-grow">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        getStatusColor(update.status_types.name)
                      }`}>
                        {update.status_types.name}
                      </span>
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-gray-900">
                          Last Known Location:
                        </div>
                        <div className="text-sm text-gray-600 flex items-start gap-1">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            {update.address && <div>{update.address}</div>}
                            <div>{update.last_city}, {update.last_state} {update.zip}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Last seen: {new Date(update.last_seen_date).toLocaleString()}
                      </div>
                      {update.case_closed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Case Closed
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        Updated: {new Date(update.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Action buttons for authorized users */}
                    {canManageUpdates && (
                      <StatusUpdateActions
                        updateId={update.id}
                        onDelete={handleStatusUpdateDelete}
                        onEdit={() => {
                          setEditingStatusUpdate(update);
                          setIsStatusModalOpen(true);
                        }}
                      />
                    )}
                  </div>

                  {/* Net Information */}
                  {update.net_id && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Net Frequency:</span> {update.frequency}
                    </div>
                  )}

                  {/* Notes Section */}
                  {update.notes && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {update.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No status updates yet.</p>
          )}
        </div>
      </div>

      <NewStatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setEditingStatusUpdate(null);
        }}
        personId={person.id}
        eventId={selectedEventId}
        statusUpdate={editingStatusUpdate}
        onStatusUpdate={loadPersonData}
      />
    </div>
  );
}