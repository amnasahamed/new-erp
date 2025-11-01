/**
 * Custom hook for student management
 * Handles loading states, errors, and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { studentsApi, Student, StudentFilters, CreateStudentRequest, UpdateStudentRequest, type ApiError } from '@/lib/api';

export function useStudents(initialFilters?: StudentFilters) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchStudents = useCallback(async (filters?: StudentFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentsApi.list(filters || initialFilters);
      setStudents(data.students);
      setTotal(data.total);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const createStudent = async (data: CreateStudentRequest): Promise<Student | null> => {
    try {
      setLoading(true);
      setError(null);
      const student = await studentsApi.create(data);
      // Refresh list after creation
      await fetchStudents();
      return student;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create student');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id: string, data: UpdateStudentRequest): Promise<Student | null> => {
    try {
      setLoading(true);
      setError(null);
      const student = await studentsApi.update(id, data);
      // Update student in local state
      setStudents(prev => prev.map(s => s.id === id ? student : s));
      return student;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update student');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pauseStudent = async (id: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const student = await studentsApi.pause(id, reason);
      // Update student in local state
      setStudents(prev => prev.map(s => s.id === id ? student : s));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to pause student');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resumeStudent = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const student = await studentsApi.resume(id);
      // Update student in local state
      setStudents(prev => prev.map(s => s.id === id ? student : s));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to resume student');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await studentsApi.delete(id);
      // Remove student from local state
      setStudents(prev => prev.filter(s => s.id !== id));
      setTotal(prev => prev - 1);
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete student');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    total,
    fetchStudents,
    createStudent,
    updateStudent,
    pauseStudent,
    resumeStudent,
    deleteStudent,
  };
}
