import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface Net {
  id: string;
  name: string;
  frequency: string;
}

interface NetFieldsProps {
  onNetChange: (netId: string | null, frequency: string) => void;
  frequency: string;
  setFrequency: (frequency: string) => void;
}

export function NetFields({ onNetChange, frequency, setFrequency }: NetFieldsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nets, setNets] = useState<Net[]>([]);
  const [selectedNetId, setSelectedNetId] = useState<string | null>(null);

  useEffect(() => {
    async function loadNets() {
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
    }

    loadNets();
  }, []);

  const handleNetChange = (netId: string) => {
    setSelectedNetId(netId);
    const selectedNet = nets.find(net => net.id === netId);
    if (selectedNet) {
      setFrequency(selectedNet.frequency || '');
      onNetChange(netId, selectedNet.frequency || '');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Net
        </label>
        <select
          value={selectedNetId || ''}
          onChange={(e) => handleNetChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select Net</option>
          {nets.map((net) => (
            <option key={net.id} value={net.id}>
              {net.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Frequency
        </label>
        <input
          type="text"
          value={frequency}
          onChange={(e) => {
            setFrequency(e.target.value);
            onNetChange(selectedNetId, e.target.value);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter frequency"
        />
      </div>
    </div>
  );
}