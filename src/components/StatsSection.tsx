import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, Radio } from 'lucide-react';
import { getStatistics } from '../lib/database';

interface Stats {
  totalSearches: number;
  closedCases: number;
  volunteers: number;
  publicUsers: number;
  lastUpdated: string;
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    totalSearches: 0,
    closedCases: 0,
    volunteers: 0,
    publicUsers: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getStatistics();
        if (data) {
          setStats({
            totalSearches: data.total_searches,
            closedCases: data.closed_cases,
            volunteers: data.volunteers,
            publicUsers: data.public_users,
            lastUpdated: data.last_updated,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const stats_data = [
    {
      name: 'Total Searches',
      value: stats.totalSearches,
      icon: Search,
      color: 'text-primary-500',
      bgColor: 'bg-primary-100',
    },
    {
      name: 'Cases Closed',
      value: stats.closedCases,
      icon: CheckCircle,
      color: 'text-accent-500',
      bgColor: 'bg-accent-100',
    },
    {
      name: 'Ham Volunteers',
      value: stats.volunteers,
      icon: Radio,
      color: 'text-primary-500',
      bgColor: 'bg-primary-100',
    },
    {
      name: 'Registered Users',
      value: stats.publicUsers,
      icon: Users,
      color: 'text-accent-500',
      bgColor: 'bg-accent-100',
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="h-16 w-16 rounded-full bg-gray-200 mb-4 mx-auto" />
              <div className="h-6 bg-gray-200 rounded w-24 mx-auto mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats_data.map((item) => (
          <div
            key={item.name}
            className="bg-white rounded-lg shadow-md p-6 transform transition-transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className={`${item.bgColor} rounded-full p-4 mb-4`}>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.name}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-4 text-sm text-gray-500">
        Last updated: {new Date(stats.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}