import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMissingPersons } from '../hooks/useDatabase';
import { useEventStore } from '../stores/eventStore';
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import type { Database } from '../types';

type MissingPerson = Database['public']['Tables']['missing_persons']['Row'] & {
  status_types: { name: string } | null;
  status_updates: Array<{
    last_city: string;
    last_state: string;
    status_types: { name: string };
  }>;
};

interface MissingPersonsTableProps {
  filters: {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
  };
}

export function MissingPersonsTable({ filters }: MissingPersonsTableProps) {
  const navigate = useNavigate();
  const [persons, setPersons] = useState<MissingPerson[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<MissingPerson[]>([]);
  const { loading, error, fetchMissingPersons } = useMissingPersons();
  const selectedEventId = useEventStore((state) => state.selectedEventId);
  const [sortField, setSortField] = useState<keyof MissingPerson>('first_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (selectedEventId) {
      fetchMissingPersons(selectedEventId).then(data => {
        if (data) {
          setPersons(data);
          setFilteredPersons(data);
        }
      });
    }
  }, [fetchMissingPersons, selectedEventId]);

  useEffect(() => {
    let result = [...persons];

    if (filters.firstName) {
      result = result.filter(person =>
        person.first_name.toLowerCase().includes(filters.firstName.toLowerCase())
      );
    }
    if (filters.lastName) {
      result = result.filter(person =>
        person.last_name.toLowerCase().includes(filters.lastName.toLowerCase())
      );
    }
    if (filters.city) {
      result = result.filter(person => {
        const lastUpdate = person.status_updates[0];
        return lastUpdate?.last_city?.toLowerCase().includes(filters.city.toLowerCase());
      });
    }
    if (filters.state) {
      result = result.filter(person => {
        const lastUpdate = person.status_updates[0];
        return lastUpdate?.last_state?.toLowerCase().includes(filters.state.toLowerCase());
      });
    }

    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });

    setFilteredPersons(result);
  }, [persons, filters, sortField, sortDirection]);

  const handleSort = (field: keyof MissingPerson) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (personId: string) => {
    navigate(`/person/${personId}`);
  };

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

  if (!selectedEventId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select an emergency event to view missing persons.
      </div>
    );
  }

  if (filteredPersons.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No missing persons found for the selected event and filters.
      </div>
    );
  }

  const SortIcon = ({ field }: { field: keyof MissingPerson }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
              onClick={() => handleSort('first_name')}
            >
              <div className="flex items-center gap-1">
                First Name
                <SortIcon field="first_name" />
              </div>
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
              onClick={() => handleSort('last_name')}
            >
              <div className="flex items-center gap-1">
                Last Name
                <SortIcon field="last_name" />
              </div>
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              City
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              State
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
              onClick={() => handleSort('age')}
            >
              <div className="flex items-center gap-1">
                Age
                <SortIcon field="age" />
              </div>
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {filteredPersons.map((person) => {
            const lastUpdate = person.status_updates[0];
            return (
              <tr
                key={person.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(person.id)}
              >
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {person.first_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {person.last_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {lastUpdate?.last_city || 'N/A'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {lastUpdate?.last_state || 'N/A'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {person.age || 'N/A'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      person.status_types?.name ? getStatusColor(person.status_types.name) : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {person.status_types?.name || 'Unknown'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
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