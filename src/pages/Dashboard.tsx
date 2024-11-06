import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { MissingPersonsTable } from '../components/MissingPersonsTable';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { AuthModal } from '../components/Auth/AuthModal';
import { EventSelector } from '../components/EventSelector';

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    city: '',
    state: '',
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewEntry = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      navigate('/new-entry');
    }
  };

  return (
    <main>
      <EventSelector />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleNewEntry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Entry
            </button>
          </div>
          <SearchBar
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <MissingPersonsTable filters={filters} />
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
}