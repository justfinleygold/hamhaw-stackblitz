import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '../../stores/eventStore';
import { supabase } from '../../lib/supabase';
import { Loader2, ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { EventUpdateModal } from '../../components/Admin/EventUpdateModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';

interface EventUpdate {
  id: string;
  event_id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
}

export function AdminUpdatesPage() {
  const navigate = useNavigate();
  const selectedEventId = useEventStore((state) => state.selectedEventId);
  const [updates, setUpdates] = useState<EventUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<EventUpdate | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    updateId: string | null;
  }>({ isOpen: false, updateId: null });

  useEffect(() => {
    if (selectedEventId) {
      loadUpdates();
    }
  }, [selectedEventId]);

  async function loadUpdates() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('event_updates')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (err) {
      console.error('Error loading updates:', err);
      setError('Failed to load updates');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(updateId: string) {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('event_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;
      await loadUpdates();
    } catch (err) {
      console.error('Error deleting update:', err);
      setError('Failed to delete update');
    } finally {
      setLoading(false);
      setDeleteConfirmation({ isOpen: false, updateId: null });
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
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Event Updates</h1>
            <button
              onClick={() => {
                setEditingUpdate(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Update
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {updates.map((update) => (
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
                        setEditingUpdate(update);
                        setIsModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmation({
                        isOpen: true,
                        updateId: update.id
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
      </div>

      {isModalOpen && selectedEventId && (
        <EventUpdateModal
          eventId={selectedEventId}
          update={editingUpdate}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUpdate(null);
          }}
          onSave={loadUpdates}
        />
      )}

      {deleteConfirmation.isOpen && (
        <ConfirmationModal
          title="Delete Update"
          message="Are you sure you want to delete this update? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => {
            if (deleteConfirmation.updateId) {
              handleDelete(deleteConfirmation.updateId);
            }
          }}
          onCancel={() => setDeleteConfirmation({ isOpen: false, updateId: null })}
        />
      )}
    </div>
  );
}