/**
 * Classes API Service
 */

import { apiClient } from './client';

export interface Class {
  id: string;
  studentId: string;
  teacherId: string;
  timetableId?: string;
  scheduledAt: string;
  duration: number; // in hours
  gmeetLink?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attendanceMarked: boolean;
  markedAt?: string;
  billingStatus: 'pending' | 'billed' | 'disputed' | 'adjusted';
  student?: {
    id: string;
    name: string;
    code: string;
  };
  teacher?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassRequest {
  studentId: string;
  teacherId: string;
  scheduledAt: string;
  duration: number;
  gmeetLink?: string;
  timetableId?: string;
}

export interface UpdateClassRequest {
  scheduledAt?: string;
  duration?: number;
  gmeetLink?: string;
  status?: Class['status'];
}

export interface MarkAttendanceRequest {
  attended: boolean;
  notes?: string;
}

export interface ClassFilters {
  date?: string;
  teacherId?: string;
  studentId?: string;
  status?: string;
  billingStatus?: string;
}

export const classesApi = {
  /**
   * List classes with filters
   */
  list: async (filters?: ClassFilters): Promise<{ classes: Class[] }> => {
    return apiClient.get('/classes', filters);
  },

  /**
   * Get class by ID
   */
  getById: async (id: string): Promise<Class> => {
    return apiClient.get(`/classes/${id}`);
  },

  /**
   * Create new class
   */
  create: async (data: CreateClassRequest): Promise<Class> => {
    return apiClient.post('/classes', data);
  },

  /**
   * Update class
   */
  update: async (id: string, data: UpdateClassRequest): Promise<Class> => {
    return apiClient.put(`/classes/${id}`, data);
  },

  /**
   * Mark attendance (starts 24-hour grace period)
   */
  markAttendance: async (id: string, data: MarkAttendanceRequest): Promise<Class> => {
    return apiClient.post(`/classes/${id}/attendance`, data);
  },

  /**
   * Cancel class (validates 2-hour rule)
   */
  cancel: async (id: string, reason?: string): Promise<Class> => {
    return apiClient.post(`/classes/${id}/cancel`, { reason });
  },

  /**
   * Delete class
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/classes/${id}`);
  },
};
