/**
 * Custom hook for demo request management
 */

import { useState, useEffect, useCallback } from 'react';
import { demosApi, DemoRequest, CreateDemoRequest, UpdateDemoRequest, AssignTeacherRequest, RecordOutcomeRequest, type ApiError } from '@/lib/api';

export function useDemos(filters?: { status?: string; departmentId?: string }) {
  const [demos, setDemos] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDemos = useCallback(async (newFilters?: typeof filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await demosApi.list(newFilters || filters);
      setDemos(data.demos);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch demo requests');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createDemo = async (data: CreateDemoRequest): Promise<DemoRequest | null> => {
    try {
      setLoading(true);
      setError(null);
      const demo = await demosApi.create(data);
      await fetchDemos();
      return demo;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create demo request');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDemo = async (id: string, data: UpdateDemoRequest): Promise<DemoRequest | null> => {
    try {
      setLoading(true);
      setError(null);
      const demo = await demosApi.update(id, data);
      setDemos(prev => prev.map(d => d.id === id ? demo : d));
      return demo;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update demo request');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const assignTeacher = async (id: string, data: AssignTeacherRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const demo = await demosApi.assignTeacher(id, data);
      setDemos(prev => prev.map(d => d.id === id ? demo : d));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to assign teacher');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const recordOutcome = async (id: string, data: RecordOutcomeRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const demo = await demosApi.recordOutcome(id, data);
      setDemos(prev => prev.map(d => d.id === id ? demo : d));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to record outcome');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDemo = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await demosApi.delete(id);
      setDemos(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete demo request');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemos();
  }, [fetchDemos]);

  return {
    demos,
    loading,
    error,
    fetchDemos,
    createDemo,
    updateDemo,
    assignTeacher,
    recordOutcome,
    deleteDemo,
  };
}
