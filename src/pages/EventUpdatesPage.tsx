import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventNews } from '../components/EventNews';

export function EventUpdatesPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <EventNews showAll={true} />
    </div>
  );
}