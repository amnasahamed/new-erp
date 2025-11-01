/**
 * Teachers API Service
 */

import { apiClient } from './client';

export interface Teacher {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  userId: string;
  departmentId?: string;
  hourlyRate: number;
  status: 'active' | 'inactive' | 'on_leave';
  subjects?: string[];
  conversionRatio?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export interface CreateTeacherRequest {
  name: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  hourlyRate: number;
  subjects?: string[];
  password?: string; // DOB format for user account
}

export interface UpdateTeacherRequest {
  name?: string;
  email?: string;
  phone?: string;
  hourlyRate?: number;
  status?: Teacher['status'];
  subjects?: string[];
}

export const teachersApi = {
  /**
   * List teachers
   */
  list: async (filters?: { status?: string; departmentId?: string }): Promise<{ teachers: Teacher[] }> => {
    return apiClient.get('/teachers', filters);
  },

  /**
   * Get teacher by ID
   */
  getById: async (id: string): Promise<Teacher> => {
    return apiClient.get(`/teachers/${id}`);
  },

  /**
   * Create new teacher
   */
  create: async (data: CreateTeacherRequest): Promise<Teacher> => {
    return apiClient.post('/teachers', data);
  },

  /**
   * Update teacher
   */
  update: async (id: string, data: UpdateTeacherRequest): Promise<Teacher> => {
    return apiClient.put(`/teachers/${id}`, data);
  },

  /**
   * Delete teacher
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/teachers/${id}`);
  },

  /**
   * Get teacher availability
   */
  getAvailability: async (id: string): Promise<{ availability: TeacherAvailability[] }> => {
    return apiClient.get(`/teachers/${id}/availability`);
  },

  /**
   * Set teacher availability
   */
  setAvailability: async (id: string, availability: Omit<TeacherAvailability, 'id' | 'teacherId'>[]): Promise<{ availability: TeacherAvailability[] }> => {
    return apiClient.post(`/teachers/${id}/availability`, { availability });
  },
};
