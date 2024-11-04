import React from 'react';
import { MapPin, Calendar, AlertCircle } from 'lucide-react';
import type { Person } from '../types';

interface PersonCardProps {
  person: Person;
}

export function PersonCard({ person }: PersonCardProps) {
  const statusColors = {
    missing: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    found: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={person.image}
          alt={person.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[person.status]
            }`}
          >
            {person.status.charAt(0).toUpperCase() + person.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
        <p className="text-sm text-gray-500">Age: {person.age}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-600">{person.lastSeen.location}</p>
          </div>
          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              {new Date(person.lastSeen.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-600">{person.description}</p>
          </div>
        </div>

        {person.updates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Update</h4>
            <div className="text-sm text-gray-600">
              {person.updates[0].details}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(person.updates[0].timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button className="text-sm text-indigo-600 hover:text-indigo-500">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}