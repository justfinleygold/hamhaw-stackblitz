import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus } from 'lucide-react';
import { NetModal } from './NetModal';
import { ConfirmationModal } from '../ConfirmationModal';

interface Net {
  id: string;
  name: string;
  description: string | null;
  frequency: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  recurring_every: string | null;
  created_at: string;
}

export function NetsTable() {
  const [nets, setNets] = useState<Net[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNet, setEditingNet] = useState<Net | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    netId: string | null;
    isDeleting: boolean;
  }>({ isOpen: false, netId: null, isDeleting: false });

  useEffect(() => {
    loadNets();
  }, []);

  const loadNets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nets')
        .select('*')
        .order('name');

      if (error) throw error;
      setNets(data || []);
    } catch (err) {
      console.error('Error loading nets:', err);
      setError('Failed to load nets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (netId: string) => {
    try {
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));
      const { error } = await supabase
        .from('nets')
        .delete()
        .eq('id', netId);

      if (error) throw error;
      setNets(prevNets => prevNets.filter(net => net.id !== netId));
      setDeleteConfirmation({ isOpen: false, netId: null, isDeleting: false });
    } catch (err) {
      console.error('Error deleting net:', err);
      setError('Failed to delete net');
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Radio Nets</h2>
        <button
          onClick={() => {
            setEditingNet(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Net
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recurring
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nets.map((net) => (
              <tr key={net.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {net.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {net.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {net.frequency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {net.start_datetime ? new Date(net.start_datetime).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {net.end_datetime ? new Date(net.end_datetime).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {net.recurring_every || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setEditingNet(net);
                        setIsModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmation({
                        isOpen: true,
                        netId: net.id,
                        isDeleting: false
                      })}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <NetModal
          net={editingNet}
          onClose={() => {
            setIsModalOpen(false);
            setEditingNet(null);
          }}
          onSave={loadNets}
        />
      )}

      {deleteConfirmation.isOpen && (
        <ConfirmationModal
          title="Delete Net"
          message="Are you sure you want to delete this net? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => {
            if (deleteConfirmation.netId) {
              handleDelete(deleteConfirmation.netId);
            }
          }}
          onCancel={() => setDeleteConfirmation({ isOpen: false, netId: null, isDeleting: false })}
        />
      )}
    </div>
  );
}