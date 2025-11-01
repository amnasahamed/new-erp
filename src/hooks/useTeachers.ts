/**
 * Custom hook for teacher management
 */

import { useState, useEffect, useCallback } from 'react';
import { teachersApi, Teacher, TeacherAvailability, CreateTeacherRequest, UpdateTeacherRequest, type ApiError } from '@/lib/api';

export function useTeachers(filters?: { status?: string; departmentId?: string }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async (newFilters?: typeof filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await teachersApi.list(newFilters || filters);
      setTeachers(data.teachers);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTeacher = async (data: CreateTeacherRequest): Promise<Teacher | null> => {
    try {
      setLoading(true);
      setError(null);
      const teacher = await teachersApi.create(data);
      await fetchTeachers();
      return teacher;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create teacher');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTeacher = async (id: string, data: UpdateTeacherRequest): Promise<Teacher | null> => {
    try {
      setLoading(true);
      setError(null);
      const teacher = await teachersApi.update(id, data);
      setTeachers(prev => prev.map(t => t.id === id ? teacher : t));
      return teacher;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update teacher');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await teachersApi.delete(id);
      setTeachers(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete teacher');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    loading,
    error,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
  };
}

export function useTeacherAvailability(teacherId: string | null) {
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!teacherId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await teachersApi.getAvailability(teacherId);
      setAvailability(data.availability);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  const updateAvailability = async (newAvailability: Omit<TeacherAvailability, 'id' | 'teacherId'>[]): Promise<boolean> => {
    if (!teacherId) return false;

    try {
      setLoading(true);
      setError(null);
      const data = await teachersApi.setAvailability(teacherId, newAvailability);
      setAvailability(data.availability);
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update availability');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return {
    availability,
    loading,
    error,
    fetchAvailability,
    updateAvailability,
  };
}
