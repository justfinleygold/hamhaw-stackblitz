import { useEffect, useState } from 'react';
import { useMissingPersons } from '../hooks/useDatabase';
import { PersonCard } from './PersonCard';
import { Loader2 } from 'lucide-react';
import type { Database } from '../types';

type MissingPerson = Database['public']['Tables']['missing_persons']['Row'];

export function MissingPersonsList() {
  const [persons, setPersons] = useState<MissingPerson[]>([]);
  const { loading, error, fetchMissingPersons } = useMissingPersons();

  useEffect(() => {
    fetchMissingPersons().then(setPersons);
  }, [fetchMissingPersons]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error loading missing persons: {error.message}</p>
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No missing persons reported yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {persons.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}