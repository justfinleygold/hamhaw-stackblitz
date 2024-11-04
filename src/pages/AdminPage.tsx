import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEventStore } from '../stores/eventStore';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { EventUpdateModal } from '../components/Admin/EventUpdateModal';
import { EventsTable } from '../components/Admin/EventsTable';
import { EventModal } from '../components/Admin/EventModal';
import { NetsTable } from '../components/Admin/NetsTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { getProfile } from '../lib/database';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  state: string | null;
  ham_callsign: string | null;
  is_volunteer: boolean;
  roles: {
    id: string;
    name: string;
  };
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface Event {
  id: string;
  name: string;
  date: string;
  description: string | null;
}

interface EventUpdate {
  id: string;
  event_id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
}

export function AdminPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const selectedEventId = useEventStore((state) => state.selectedEventId);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventUpdates, setEventUpdates] = useState<EventUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventUpdateModalOpen, setIsEventUpdateModalOpen] = useState(false);
  const [editingEventUpdate, setEditingEventUpdate] = useState<EventUpdate | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'nets' | 'updates'>('users');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemType: 'user' | 'eventUpdate' | null;
  }>({ isOpen: false, itemId: null, itemType: null });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Check if user has admin role
    getProfile(user.id).then(profile => {
      if (!profile?.roles?.name || profile.roles.name !== 'admin') {
        navigate('/');
        return;
      }
      loadData();
    }).catch(() => {
      navigate('/');
    });
  }, [user, navigate]);

  useEffect(() => {
    if (selectedEventId) {
      loadEventUpdates();
    }
  }, [selectedEventId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Load roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rolesError) throw rolesError;
      setRoles(rolesData);

      // Load users with their roles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            id,
            name
          )
        `)
        .order('email');

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Load event updates if we have a selected event
      if (selectedEventId) {
        await loadEventUpdates();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadEventUpdates() {
    try {
      const { data, error } = await supabase
        .from('event_updates')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEventUpdates(data || []);
    } catch (err) {
      console.error('Error loading event updates:', err);
      setError('Failed to load event updates');
    }
  }

  async function handleUserUpdate(userId: string, updates: Partial<User>) {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateError) throw updateError;

      await loadData();
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirmation.itemId || !deleteConfirmation.itemType) return;

    try {
      setLoading(true);
      setError(null);

      if (deleteConfirmation.itemType === 'eventUpdate') {
        const { error } = await supabase
          .from('event_updates')
          .delete()
          .eq('id', deleteConfirmation.itemId);

        if (error) throw error;
        await loadEventUpdates();
      }

      setDeleteConfirmation({ isOpen: false, itemId: null, itemType: null });
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'events'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('nets')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'nets'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Nets
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'updates'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Event Updates
            </button>
          </nav>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.city}, {user.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.roles?.name || 'No Role'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Events</h2>
                <button
                  onClick={() => setIsEventModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </button>
              </div>
              <EventsTable events={events} onUpdate={loadData} />
            </div>
          )}

          {activeTab === 'nets' && (
            <NetsTable />
          )}

          {activeTab === 'updates' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Event Updates</h2>
                <button
                  onClick={() => {
                    setEditingEventUpdate(null);
                    setIsEventUpdateModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Update
                </button>
              </div>

              <div className="space-y-4">
                {eventUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {update.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(update.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingEventUpdate(update);
                            setIsEventUpdateModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation({
                            isOpen: true,
                            itemId: update.id,
                            itemType: 'eventUpdate'
                          })}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-600">{update.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isEventModalOpen && (
        <EventModal
          event={null}
          onClose={() => setIsEventModalOpen(false)}
          onSave={() => {
            loadData();
            setIsEventModalOpen(false);
          }}
        />
      )}

      {isEventUpdateModalOpen && selectedEventId && (
        <EventUpdateModal
          eventId={selectedEventId}
          update={editingEventUpdate}
          onClose={() => {
            setIsEventUpdateModalOpen(false);
            setEditingEventUpdate(null);
          }}
          onSave={loadEventUpdates}
        />
      )}

      {deleteConfirmation.isOpen && (
        <ConfirmationModal
          title="Delete Update"
          message="Are you sure you want to delete this update? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmation({ isOpen: false, itemId: null, itemType: null })}
        />
      )}
    </div>
  );
}