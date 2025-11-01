/**
 * Demo Requests API Service
 */

import { apiClient } from './client';

export interface DemoRequest {
  id: string;
  studentName: string;
  parentName: string;
  parentEmail?: string;
  parentPhone?: string;
  studentId?: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
  };
  teacherId?: string;
  teacher?: {
    id: string;
    name: string;
  };
  scheduledAt?: string;
  gmeetLink?: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  outcome?: 'registered' | 'not_interested' | 'follow_up';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDemoRequest {
  studentName: string;
  parentName: string;
  parentEmail?: string;
  parentPhone?: string;
  departmentId: string;
  studentId?: string;
  notes?: string;
}

export interface UpdateDemoRequest {
  studentName?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  scheduledAt?: string;
  gmeetLink?: string;
  status?: DemoRequest['status'];
  notes?: string;
}

export interface AssignTeacherRequest {
  teacherId: string;
  scheduledAt: string;
  gmeetLink?: string;
}

export interface RecordOutcomeRequest {
  outcome: 'registered' | 'not_interested' | 'follow_up';
  notes?: string;
}

export const demosApi = {
  /**
   * List demo requests
   */
  list: async (filters?: { status?: string; departmentId?: string }): Promise<{ demos: DemoRequest[] }> => {
    return apiClient.get('/demos', filters);
  },

  /**
   * Get demo by ID
   */
  getById: async (id: string): Promise<DemoRequest> => {
    return apiClient.get(`/demos/${id}`);
  },

  /**
   * Create new demo request
   */
  create: async (data: CreateDemoRequest): Promise<DemoRequest> => {
    return apiClient.post('/demos', data);
  },

  /**
   * Update demo request
   */
  update: async (id: string, data: UpdateDemoRequest): Promise<DemoRequest> => {
    return apiClient.put(`/demos/${id}`, data);
  },

  /**
   * Assign teacher to demo
   */
  assignTeacher: async (id: string, data: AssignTeacherRequest): Promise<DemoRequest> => {
    return apiClient.post(`/demos/${id}/assign`, data);
  },

  /**
   * Record demo outcome (updates teacher conversion ratio)
   */
  recordOutcome: async (id: string, data: RecordOutcomeRequest): Promise<DemoRequest> => {
    return apiClient.post(`/demos/${id}/outcome`, data);
  },

  /**
   * Delete demo request
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/demos/${id}`);
  },
};
