/**
 * Custom hook for ledger management
 */

import { useState, useEffect, useCallback } from 'react';
import { ledgerApi, LedgerEntry, LedgerFilters, AddPaymentRequest, type ApiError } from '@/lib/api';

export function useLedger(initialFilters?: LedgerFilters) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchLedger = useCallback(async (filters?: LedgerFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ledgerApi.list(filters || initialFilters);
      setEntries(data.entries);
      setTotal(data.total);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch ledger entries');
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const addPayment = async (data: AddPaymentRequest): Promise<LedgerEntry | null> => {
    try {
      setLoading(true);
      setError(null);
      const entry = await ledgerApi.addPayment(data);
      await fetchLedger();
      return entry;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to add payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportLedger = async (filters?: LedgerFilters, format: 'csv' | 'excel' = 'csv'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const blob = await ledgerApi.export(filters || initialFilters, format);

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger-export-${new Date().toISOString()}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to export ledger');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return {
    entries,
    loading,
    error,
    total,
    fetchLedger,
    addPayment,
    exportLedger,
  };
}
