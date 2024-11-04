import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEventStore } from '../stores/eventStore';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowLeft, Plus, Check, Pencil, Trash2, MapPin } from 'lucide-react';
import { NeedModal } from '../components/Needs/NeedModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface Need {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  created_at: string;
  created_by: string;
  fulfilled_at: string | null;
  fulfilled_by: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
}

function formatLocation(need: Need) {
  const parts = [];
  if (need.address) parts.push(need.address);
  if (need.city && need.state) parts.push(`${need.city}, ${need.state}`);
  if (need.zip) parts.push(need.zip);
  return parts.join(' ') || 'No location specified';
}

export function NeedsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const selectedEventId = useEventStore((state) => state.selectedEventId);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<Need | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHam, setIsHam] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    needId: string | null;
  }>({ isOpen: false, needId: null });

  useEffect(() => {
    if (!selectedEventId) {
      navigate('/');
      return;
    }

    checkUserRole();
    loadNeeds();
  }, [selectedEventId, navigate]);

  const checkUserRole = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single();

    if (profile) {
      const { data: role } = await supabase
        .from('roles')
        .select('name')
        .eq('id', profile.role_id)
        .single();

      if (role) {
        setIsAdmin(role.name === 'admin');
        setIsHam(role.name === 'ham');
      }
    }
  };

  const loadNeeds = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('needs')
        .select(`
          *,
          profiles:created_by (
            first_name,
            last_name
          )
        `)
        .eq('event_id', selectedEventId);

      if (error) throw error;

      // Sort needs by priority and status
      const sortedNeeds = (data || []).sort((a, b) => {
        // Special handling for fulfilled status - always at the bottom
        if (a.status === 'fulfilled' && b.status !== 'fulfilled') return 1;
        if (b.status === 'fulfilled' && a.status !== 'fulfilled') return -1;

        // For non-fulfilled items, sort by priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // If same priority, sort by date (oldest first)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      setNeeds(sortedNeeds);
    } catch (err) {
      console.error('Error loading needs:', err);
      setError('Failed to load needs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (needId: string) => {
    try {
      const { error } = await supabase
        .from('needs')
        .delete()
        .eq('id', needId);

      if (error) throw error;
      loadNeeds();
    } catch (err) {
      console.error('Error deleting need:', err);
      setError('Failed to delete need');
    } finally {
      setDeleteConfirmation({ isOpen: false, needId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {user && (
          <button
            onClick={() => {
              setEditingNeed(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Need
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Needs</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {needs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No needs found for this event.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {needs.map((need) => (
                    <tr key={need.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {need.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {need.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{formatLocation(need)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            need.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : need.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {need.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            need.status === 'open'
                              ? 'bg-green-100 text-green-800'
                              : need.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {need.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {need.profiles.first_name} {need.profiles.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(need.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(isAdmin || isHam) && need.status !== 'fulfilled' && (
                            <button
                              onClick={() => handleStatusChange(need.id, 'fulfilled')}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Fulfilled"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {(isAdmin || isHam || need.created_by === user?.id) && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingNeed(need);
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
                                  needId: need.id
                                })}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <NeedModal
          eventId={selectedEventId!}
          need={editingNeed}
          onClose={() => {
            setIsModalOpen(false);
            setEditingNeed(null);
          }}
          onSave={loadNeeds}
        />
      )}

      {deleteConfirmation.isOpen && (
        <ConfirmationModal
          title="Delete Need"
          message="Are you sure you want to delete this need? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => {
            if (deleteConfirmation.needId) {
              handleDelete(deleteConfirmation.needId);
            }
          }}
          onCancel={() => setDeleteConfirmation({ isOpen: false, needId: null })}
        />
      )}
    </div>
  );
}