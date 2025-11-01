/**
 * Students API Service
 */

import { apiClient } from './client';

export interface Student {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
  };
  parentId: string;
  parent?: {
    id: string;
    email: string;
    name?: string;
  };
  balance: number;
  status: 'ongoing' | 'paused' | 'completed' | 'dropped';
  gmeetLink?: string;
  enrolledAt: string;
  demoRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  name: string;
  email?: string;
  phone?: string;
  departmentId: string;
  parentId: string;
  balance?: number;
  gmeetLink?: string;
  demoRequestId?: string;
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  phone?: string;
  balance?: number;
  gmeetLink?: string;
  status?: Student['status'];
}

export interface StudentFilters {
  status?: string;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const studentsApi = {
  /**
   * List students with optional filters
   */
  list: async (filters?: StudentFilters): Promise<{ students: Student[]; total: number }> => {
    return apiClient.get('/students', filters);
  },

  /**
   * Get student by ID
   */
  getById: async (id: string): Promise<Student> => {
    return apiClient.get(`/students/${id}`);
  },

  /**
   * Create new student
   */
  create: async (data: CreateStudentRequest): Promise<Student> => {
    return apiClient.post('/students', data);
  },

  /**
   * Update student
   */
  update: async (id: string, data: UpdateStudentRequest): Promise<Student> => {
    return apiClient.put(`/students/${id}`, data);
  },

  /**
   * Delete student
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/students/${id}`);
  },

  /**
   * Pause student
   */
  pause: async (id: string, reason?: string): Promise<Student> => {
    return apiClient.post(`/students/${id}/pause`, { reason });
  },

  /**
   * Resume student
   */
  resume: async (id: string): Promise<Student> => {
    return apiClient.post(`/students/${id}/resume`);
  },
};
