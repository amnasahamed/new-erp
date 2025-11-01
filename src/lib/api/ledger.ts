/**
 * Account Ledger API Service
 */

import { apiClient } from './client';

export interface LedgerEntry {
  id: string;
  studentId: string;
  student?: {
    id: string;
    name: string;
    code: string;
  };
  classId?: string;
  class?: {
    id: string;
    scheduledAt: string;
  };
  type: 'payment' | 'debit' | 'refund' | 'adjustment';
  credit: number;
  debit: number;
  balance: number;
  narration: string;
  createdBy: string;
  createdByUser?: {
    id: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export interface AddPaymentRequest {
  studentId: string;
  amount: number;
  narration: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface LedgerFilters {
  studentId?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}

export const ledgerApi = {
  /**
   * Get ledger entries with filters
   */
  list: async (filters?: LedgerFilters): Promise<{ entries: LedgerEntry[]; total: number }> => {
    return apiClient.get('/ledger', filters);
  },

  /**
   * Add payment (credit to student account)
   */
  addPayment: async (data: AddPaymentRequest): Promise<LedgerEntry> => {
    return apiClient.post('/ledger/payment', data);
  },

  /**
   * Export ledger to CSV/Excel
   */
  export: async (filters?: LedgerFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
    const params = { ...filters, format };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/ledger/export?${new URLSearchParams(params as any)}`,
      {
        headers: {
          Authorization: `Bearer ${apiClient.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};
