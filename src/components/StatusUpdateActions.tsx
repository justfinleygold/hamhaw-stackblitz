import { useState } from 'react';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { supabase } from '../lib/supabase';

interface StatusUpdateActionsProps {
  updateId: string;
  onDelete: () => Promise<void>;
  onEdit: () => void;
}

export function StatusUpdateActions({ updateId, onDelete, onEdit }: StatusUpdateActionsProps) {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!updateId) return;
    
    try {
      setIsDeleting(true);
      setError(null);

      // Delete the status update
      const { error: deleteError } = await supabase
        .from('status_updates')
        .delete()
        .match({ id: updateId });

      if (deleteError) throw deleteError;

      // Close modal first
      setIsConfirmationModalOpen(false);
      
      // Then refresh data
      await onDelete();
    } catch (err) {
      console.error('Error deleting status update:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete status update');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-indigo-600 hover:text-indigo-900"
          title="Edit Update"
          disabled={isDeleting}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirmationModalOpen(true);
          }}
          className="text-red-600 hover:text-red-900"
          title="Delete Update"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {isConfirmationModalOpen && (
        <ConfirmationModal
          title="Delete Status Update"
          message="Are you sure you want to delete this status update? This action cannot be undone."
          confirmLabel={isDeleting ? "Deleting..." : "Delete"}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmationModalOpen(false)}
        />
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </>
  );
}