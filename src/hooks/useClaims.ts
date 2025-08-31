import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Claim } from '@/lib/dbTypes';

interface UseClaimsOptions {
  state?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  dateRange?: {
    start: string;
    end: string;
  };
}

export function useClaims(options: UseClaimsOptions = {}) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClaims() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('claims')
          .select('*')
          .order('date', { ascending: false });

        if (options.state) {
          query = query.eq('state', options.state);
        }

        if (options.status) {
          query = query.eq('status', options.status);
        }

        if (options.dateRange) {
          query = query
            .gte('date', options.dateRange.start)
            .lte('date', options.dateRange.end);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // If no data from database, use demo data
        if (!data || data.length === 0) {
          const demoClaims: Claim[] = [
            {
              id: 'demo-1',
              type: 'IFR',
              state: 'Maharashtra',
              village: 'Bhamragad',
              area: 1.8,
              status: 'Approved',
              date: '2024-01-15',
              applicantName: 'Sukhlal Gond',
              tribe: 'Gond',
              povertyIndex: 0.75,
              groundwaterIndex: 0.35,
              agriArea: 2.5,
              forestDegradation: 45.2,
              created_at: '2024-01-15T00:00:00Z',
              updated_at: '2024-01-15T00:00:00Z'
            },
            {
              id: 'demo-2',
              type: 'CFR',
              state: 'Maharashtra',
              village: 'Bhamragad',
              area: 15.2,
              status: 'Approved',
              date: '2024-01-20',
              applicantName: 'Community Claim',
              tribe: 'Gond',
              povertyIndex: 0.82,
              groundwaterIndex: 0.28,
              agriArea: 8.7,
              forestDegradation: 52.1,
              created_at: '2024-01-20T00:00:00Z',
              updated_at: '2024-01-20T00:00:00Z'
            },
            {
              id: 'demo-3',
              type: 'IFR',
              state: 'Maharashtra',
              village: 'Etapalli',
              area: 2.1,
              status: 'Pending',
              date: '2024-02-10',
              applicantName: 'Ramesh Korku',
              tribe: 'Korku',
              povertyIndex: 0.68,
              groundwaterIndex: 0.42,
              agriArea: 3.2,
              forestDegradation: 38.5,
              created_at: '2024-02-10T00:00:00Z',
              updated_at: '2024-02-10T00:00:00Z'
            },
            {
              id: 'demo-4',
              type: 'CR',
              state: 'Maharashtra',
              village: 'Etapalli',
              area: 5.5,
              status: 'Approved',
              date: '2024-02-15',
              applicantName: 'Community Claim',
              tribe: 'Korku',
              povertyIndex: 0.71,
              groundwaterIndex: 0.38,
              agriArea: 4.8,
              forestDegradation: 41.3,
              created_at: '2024-02-15T00:00:00Z',
              updated_at: '2024-02-15T00:00:00Z'
            },
            {
              id: 'demo-5',
              type: 'IFR',
              state: 'Chhattisgarh',
              village: 'Bijapur',
              area: 1.5,
              status: 'Rejected',
              date: '2024-03-05',
              applicantName: 'Lakshmi Muria',
              tribe: 'Muria',
              povertyIndex: 0.65,
              groundwaterIndex: 0.45,
              agriArea: 1.8,
              forestDegradation: 35.7,
              created_at: '2024-03-05T00:00:00Z',
              updated_at: '2024-03-05T00:00:00Z'
            }
          ];
          
          setClaims(demoClaims);
          console.log('Using demo claims data:', demoClaims);
        } else {
          setClaims(data);
          console.log('Using database claims data:', data);
        }
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch claims');
        
        // Fallback to demo data on error
        const demoClaims: Claim[] = [
          {
            id: 'fallback-1',
            type: 'IFR',
            state: 'Maharashtra',
            village: 'Bhamragad',
            area: 1.8,
            status: 'Approved',
            date: '2024-01-15',
            applicantName: 'Sukhlal Gond',
            tribe: 'Gond',
            povertyIndex: 0.75,
            groundwaterIndex: 0.35,
            agriArea: 2.5,
            forestDegradation: 45.2,
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
          }
        ];
        
        setClaims(demoClaims);
        console.log('Using fallback demo claims data:', demoClaims);
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, [options.state, options.status, options.dateRange]);

  return { claims, loading, error };
}

// Hook for claims statistics
export function useClaimsStats() {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    approvalRate: 0,
    totalCFRArea: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('claims')
          .select('status, area, type');

        if (error) {
          throw error;
        }

        const claims = data || [];
        const total = claims.length;
        const approved = claims.filter(c => c.status === 'Approved').length;
        const pending = claims.filter(c => c.status === 'Pending').length;
        const rejected = claims.filter(c => c.status === 'Rejected').length;
        const approvalRate = total > 0 ? (approved / total) * 100 : 0;
        const totalCFRArea = claims
          .filter(c => c.type === 'CFR' && c.status === 'Approved')
          .reduce((sum, c) => sum + c.area, 0);

        setStats({
          total,
          approved,
          pending,
          rejected,
          approvalRate: Math.round(approvalRate),
          totalCFRArea: Math.round(totalCFRArea)
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}

// Hook for monthly trends
export function useMonthlyTrends() {
  const [trends, setTrends] = useState<Array<{
    month: string;
    processed: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('claims')
          .select('date, status');

        if (error) {
          throw error;
        }

        const claims = data || [];
        const monthlyData = new Map<string, number>();

        claims.forEach(claim => {
          const date = new Date(claim.date);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
        });

        const trends = Array.from(monthlyData.entries())
          .map(([month, processed]) => ({ month, processed }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        setTrends(trends);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trends');
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  return { trends, loading, error };
}
