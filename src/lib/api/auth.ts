/**
 * Authentication API Service
 */

import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string; // DOB format: DD-MM-YYYY
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'coordinator' | 'teacher' | 'parent' | 'hr' | 'accountant';
    departmentId?: string;
    name?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
  name?: string;
  departmentId?: string;
}

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    // Set token in client
    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/register', data);
  },

  /**
   * Verify credentials
   */
  verify: async (credentials: LoginRequest): Promise<{ valid: boolean; user?: any }> => {
    return apiClient.post('/auth/verify', credentials);
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear token regardless of API response
      apiClient.setToken(null);
    }
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<LoginResponse['user']> => {
    return apiClient.get('/auth/me');
  },
};
