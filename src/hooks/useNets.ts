import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Net {
  id: string;
  name: string;
  frequency: string | null;
}

export function useNets() {
  const [nets, setNets] = useState<Net[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNets() {
      try {
        const { data, error } = await supabase
          .from('nets')
          .select('id, name, frequency')
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

  return { nets, loading, error };
}