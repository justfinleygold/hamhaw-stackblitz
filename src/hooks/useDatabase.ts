import { useState, useCallback } from 'react';
import * as db from '../lib/database';
import type { Database } from '../types';

type Tables = Database['public']['Tables'];

export function useMissingPersons() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMissingPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      return await db.getMissingPersons();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch missing persons'));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createMissingPerson = useCallback(
    async (person: Tables['missing_persons']['Insert']) => {
      try {
        setLoading(true);
        setError(null);
        return await db.createMissingPerson(person);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create missing person'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateMissingPerson = useCallback(
    async (id: string, updates: Tables['missing_persons']['Update']) => {
      try {
        setLoading(true);
        setError(null);
        return await db.updateMissingPerson(id, updates);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update missing person'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    fetchMissingPersons,
    createMissingPerson,
    updateMissingPerson,
  };
}

export function useUpdates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUpdate = useCallback(async (update: Tables['updates']['Insert']) => {
    try {
      setLoading(true);
      setError(null);
      return await db.createUpdate(update);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create update'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createUpdate,
  };
}

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await db.getProfile(userId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (userId: string, updates: Tables['profiles']['Update']) => {
      try {
        setLoading(true);
        setError(null);
        return await db.updateProfile(userId, updates);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update profile'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    getProfile,
    updateProfile,
  };
}