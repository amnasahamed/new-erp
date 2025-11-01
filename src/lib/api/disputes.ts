/**
 * Disputes API Service
 */

import { apiClient } from './client';

export interface Dispute {
  id: string;
  classId: string;
  class?: {
    id: string;
    scheduledAt: string;
    student: {
      id: string;
      name: string;
    };
    teacher: {
      id: string;
      name: string;
    };
  };
  raisedBy: string;
  raisedByUser?: {
    id: string;
    email: string;
    role: string;
  };
  reason: string;
  description?: string;
  status: 'open' | 'escalated' | 'resolved' | 'rejected';
  resolutionNotes?: string;
  finalAdjustmentHours?: number;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RaiseDisputeRequest {
  classId: string;
  reason: string;
  description?: string;
}

export interface ResolveDisputeRequest {
  finalAdjustmentHours: number;
  resolutionNotes: string;
}

export const disputesApi = {
  /**
   * List disputes
   */
  list: async (filters?: { status?: string; studentId?: string }): Promise<{ disputes: Dispute[] }> => {
    return apiClient.get('/disputes', filters);
  },

  /**
   * Get dispute by ID
   */
  getById: async (id: string): Promise<Dispute> => {
    return apiClient.get(`/disputes/${id}`);
  },

  /**
   * Raise new dispute (pauses billing on class)
   */
  raise: async (data: RaiseDisputeRequest): Promise<Dispute> => {
    return apiClient.post('/disputes', data);
  },

  /**
   * Escalate dispute to admin
   */
  escalate: async (id: string): Promise<Dispute> => {
    return apiClient.post(`/disputes/${id}/escalate`);
  },

  /**
   * Resolve dispute with adjustment
   */
  resolve: async (id: string, data: ResolveDisputeRequest): Promise<Dispute> => {
    return apiClient.post(`/disputes/${id}/resolve`, data);
  },
};
