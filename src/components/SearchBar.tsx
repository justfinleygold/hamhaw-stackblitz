import React from 'react';

interface SearchBarProps {
  filters: {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
  };
  onFilterChange: (field: string, value: string) => void;
}

export function SearchBar({ filters, onFilterChange }: SearchBarProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Filter Results</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm text-gray-500 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={filters.firstName}
              onChange={(e) => onFilterChange('firstName', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Filter by first name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm text-gray-500 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={filters.lastName}
              onChange={(e) => onFilterChange('lastName', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Filter by last name"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm text-gray-500 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              value={filters.city}
              onChange={(e) => onFilterChange('city', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Filter by city"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm text-gray-500 mb-1">
              State
            </label>
            <input
              type="text"
              id="state"
              value={filters.state}
              onChange={(e) => onFilterChange('state', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Filter by state"
            />
          </div>
        </div>
      </div>
    </div>
  );
}