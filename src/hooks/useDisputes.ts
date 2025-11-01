/**
 * Custom hook for dispute management
 */

import { useState, useEffect, useCallback } from 'react';
import { disputesApi, Dispute, RaiseDisputeRequest, ResolveDisputeRequest, type ApiError } from '@/lib/api';

export function useDisputes(filters?: { status?: string; studentId?: string }) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = useCallback(async (newFilters?: typeof filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await disputesApi.list(newFilters || filters);
      setDisputes(data.disputes);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const raiseDispute = async (data: RaiseDisputeRequest): Promise<Dispute | null> => {
    try {
      setLoading(true);
      setError(null);
      const dispute = await disputesApi.raise(data);
      await fetchDisputes();
      return dispute;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to raise dispute');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const escalateDispute = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const dispute = await disputesApi.escalate(id);
      setDisputes(prev => prev.map(d => d.id === id ? dispute : d));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to escalate dispute');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (id: string, data: ResolveDisputeRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const dispute = await disputesApi.resolve(id, data);
      setDisputes(prev => prev.map(d => d.id === id ? dispute : d));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to resolve dispute');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return {
    disputes,
    loading,
    error,
    fetchDisputes,
    raiseDispute,
    escalateDispute,
    resolveDispute,
  };
}
