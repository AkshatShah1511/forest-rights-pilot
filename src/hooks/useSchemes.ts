import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Scheme } from '@/lib/dbTypes';

interface UseSchemesOptions {
  filters?: {
    minBudget?: number;
    maxBudget?: number;
    minPriority?: number;
    maxPriority?: number;
  };
}

export function useSchemes(options: UseSchemesOptions = {}) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchemes() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('schemes')
          .select('*')
          .order('priority', { ascending: false });

        if (options.filters?.minBudget) {
          query = query.gte('budget', options.filters.minBudget);
        }

        if (options.filters?.maxBudget) {
          query = query.lte('budget', options.filters.maxBudget);
        }

        if (options.filters?.minPriority) {
          query = query.gte('priority', options.filters.minPriority);
        }

        if (options.filters?.maxPriority) {
          query = query.lte('priority', options.filters.maxPriority);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setSchemes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch schemes');
      } finally {
        setLoading(false);
      }
    }

    fetchSchemes();
  }, [options.filters]);

  return { schemes, loading, error };
}

// Hook for scheme eligibility matching
export function useSchemeEligibility(claimData?: {
  povertyIndex: number;
  groundwaterIndex: number;
  agriArea: number;
  forestDegradation: number;
}) {
  const [eligibleSchemes, setEligibleSchemes] = useState<Array<Scheme & {
    matchPercentage: number;
    supportingEvidence: string[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEligibleSchemes() {
      if (!claimData) {
        setEligibleSchemes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('schemes')
          .select('*');

        if (error) {
          throw error;
        }

        const schemes = data || [];
        const eligible = schemes.map(scheme => {
          const eligibility = scheme.eligibility as any;
          let matchScore = 0;
          const evidence: string[] = [];

          // Check poverty index eligibility
          if (eligibility.povertyIndex && claimData.povertyIndex >= eligibility.povertyIndex.min) {
            matchScore += 25;
            evidence.push(`Poverty Index: ${claimData.povertyIndex} (min: ${eligibility.povertyIndex.min})`);
          }

          // Check groundwater index eligibility
          if (eligibility.groundwaterIndex && claimData.groundwaterIndex <= eligibility.groundwaterIndex.max) {
            matchScore += 25;
            evidence.push(`Groundwater Index: ${claimData.groundwaterIndex} (max: ${eligibility.groundwaterIndex.max})`);
          }

          // Check agricultural area eligibility
          if (eligibility.agriArea && claimData.agriArea >= eligibility.agriArea.min) {
            matchScore += 25;
            evidence.push(`Agricultural Area: ${claimData.agriArea} ha (min: ${eligibility.agriArea.min} ha)`);
          }

          // Check forest degradation eligibility
          if (eligibility.forestDegradation && claimData.forestDegradation <= eligibility.forestDegradation.max) {
            matchScore += 25;
            evidence.push(`Forest Degradation: ${claimData.forestDegradation}% (max: ${eligibility.forestDegradation.max}%)`);
          }

          return {
            ...scheme,
            matchPercentage: matchScore,
            supportingEvidence: evidence
          };
        }).filter(scheme => scheme.matchPercentage > 0)
          .sort((a, b) => b.matchPercentage - a.matchPercentage);

        setEligibleSchemes(eligible);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch eligible schemes');
      } finally {
        setLoading(false);
      }
    }

    fetchEligibleSchemes();
  }, [claimData]);

  return { eligibleSchemes, loading, error };
}
