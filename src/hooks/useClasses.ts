/**
 * Custom hook for class management
 */

import { useState, useEffect, useCallback } from 'react';
import { classesApi, Class, ClassFilters, CreateClassRequest, UpdateClassRequest, MarkAttendanceRequest, type ApiError } from '@/lib/api';

export function useClasses(initialFilters?: ClassFilters) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async (filters?: ClassFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await classesApi.list(filters || initialFilters);
      setClasses(data.classes);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const createClass = async (data: CreateClassRequest): Promise<Class | null> => {
    try {
      setLoading(true);
      setError(null);
      const classSession = await classesApi.create(data);
      await fetchClasses();
      return classSession;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create class');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateClass = async (id: string, data: UpdateClassRequest): Promise<Class | null> => {
    try {
      setLoading(true);
      setError(null);
      const classSession = await classesApi.update(id, data);
      setClasses(prev => prev.map(c => c.id === id ? classSession : c));
      return classSession;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update class');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (id: string, data: MarkAttendanceRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const classSession = await classesApi.markAttendance(id, data);
      setClasses(prev => prev.map(c => c.id === id ? classSession : c));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to mark attendance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelClass = async (id: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const classSession = await classesApi.cancel(id, reason);
      setClasses(prev => prev.map(c => c.id === id ? classSession : c));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to cancel class');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await classesApi.delete(id);
      setClasses(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete class');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    loading,
    error,
    fetchClasses,
    createClass,
    updateClass,
    markAttendance,
    cancelClass,
    deleteClass,
  };
}

// Hook for getting today's classes
export function useTodayClasses(teacherId?: string, studentId?: string) {
  const today = new Date().toISOString().split('T')[0];
  return useClasses({
    date: today,
    teacherId,
    studentId,
  });
}
