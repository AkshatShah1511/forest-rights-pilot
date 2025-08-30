// Decision Support System scoring logic

export interface Village {
  id: string;
  name: string;
  groundwaterIndex: number;
  agriAreaHa: number;
  forestDegradationLevel: number;
  povertyScore: number;
  waterBodiesCount: number;
  population: number;
  homesteadCount: number;
}

export interface Scheme {
  id: string;
  name: string;
  eligibility: string[];
  evidenceKeys: string[];
  weights: {
    lowWater: number;
    agri: number;
    degradation: number;
    poverty: number;
  };
}

export interface Recommendation {
  schemeId: string;
  schemeName: string;
  villageId: string;
  villageName: string;
  priority: 'High' | 'Medium' | 'Low';
  score: number;
  evidence: string[];
  justification: string;
  estimatedBudget: number;
  affectedHouseholds: number;
}

export function calculateVillageScores(village: Village): {
  lowWater: number;
  agri: number;
  degradation: number;
  poverty: number;
} {
  return {
    lowWater: village.groundwaterIndex < 0.4 ? 1 : 0,
    agri: village.agriAreaHa >= 50 ? 1 : 0,
    degradation: village.forestDegradationLevel >= 0.5 ? 1 : 0,
    poverty: village.povertyScore >= 0.5 ? 1 : 0
  };
}

export function calculateSchemeScore(village: Village, scheme: Scheme): number {
  const scores = calculateVillageScores(village);
  
  return (
    scheme.weights.lowWater * scores.lowWater +
    scheme.weights.agri * scores.agri +
    scheme.weights.degradation * scores.degradation +
    scheme.weights.poverty * scores.poverty
  );
}

export function getPriority(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 3) return 'High';
  if (score === 2) return 'Medium';
  return 'Low';
}

export function generateEvidence(village: Village, scheme: Scheme): string[] {
  const evidence: string[] = [];
  
  if (scheme.evidenceKeys.includes('groundwaterIndex')) {
    const status = village.groundwaterIndex < 0.4 ? 'Low' : 'Adequate';
    evidence.push(`Groundwater Index: ${village.groundwaterIndex.toFixed(2)} (${status})`);
  }
  
  if (scheme.evidenceKeys.includes('agriAreaHa')) {
    evidence.push(`Agricultural Area: ${village.agriAreaHa} ha`);
  }
  
  if (scheme.evidenceKeys.includes('forestDegradationLevel')) {
    const level = village.forestDegradationLevel >= 0.5 ? 'High' : 'Moderate';
    evidence.push(`Forest Degradation: ${(village.forestDegradationLevel * 100).toFixed(0)}% (${level})`);
  }
  
  if (scheme.evidenceKeys.includes('povertyScore')) {
    const level = village.povertyScore >= 0.5 ? 'High' : 'Moderate';
    evidence.push(`Poverty Score: ${(village.povertyScore * 100).toFixed(0)}% (${level})`);
  }
  
  if (scheme.evidenceKeys.includes('waterBodiesCount')) {
    const perHundred = Math.round((village.waterBodiesCount / village.homesteadCount) * 100);
    evidence.push(`Water Bodies: ${village.waterBodiesCount} (${perHundred} per 100 households)`);
  }
  
  return evidence;
}

export function generateJustification(village: Village, scheme: Scheme, priority: string): string {
  const justifications = {
    'JJM': `${village.name} shows ${village.groundwaterIndex < 0.4 ? 'critical' : 'moderate'} water stress with ${village.waterBodiesCount} water bodies serving ${village.homesteadCount} households.`,
    'PMKISAN': `Agricultural potential of ${village.agriAreaHa} ha makes this village suitable for direct benefit transfer support.`,
    'CAMPA': `Forest degradation level of ${(village.forestDegradationLevel * 100).toFixed(0)}% indicates urgent need for restoration activities.`,
    'MGNREGA-WC': `Combined indicators suggest high potential for water conservation works benefiting ${village.homesteadCount} households.`,
    'DAJGUA': `Multi-sectoral convergence opportunity with tribal population and diverse livelihood needs.`
  };
  
  return justifications[scheme.id] || `Priority ${priority} recommendation based on village indicators.`;
}

export function generateRecommendations(villages: Village[], schemes: Scheme[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  villages.forEach(village => {
    schemes.forEach(scheme => {
      const score = calculateSchemeScore(village, scheme);
      const priority = getPriority(score);
      const evidence = generateEvidence(village, scheme);
      const justification = generateJustification(village, scheme, priority);
      
      // Estimate budget and households (mock calculations)
      const baseHouseholds = Math.floor(village.homesteadCount * 0.6); // 60% coverage
      const affectedHouseholds = Math.max(baseHouseholds, 10);
      const estimatedBudget = affectedHouseholds * (scheme.id === 'JJM' ? 15000 : 
                                                  scheme.id === 'PMKISAN' ? 6000 :
                                                  scheme.id === 'CAMPA' ? 25000 :
                                                  scheme.id === 'MGNREGA-WC' ? 18000 : 20000);
      
      recommendations.push({
        schemeId: scheme.id,
        schemeName: scheme.name,
        villageId: village.id,
        villageName: village.name,
        priority,
        score,
        evidence,
        justification,
        estimatedBudget,
        affectedHouseholds
      });
    });
  });
  
  // Sort by priority and score
  return recommendations.sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.score - a.score;
  });
}

export function filterRecommendations(
  recommendations: Recommendation[],
  filters: {
    states?: string[];
    villages?: string[];
    priorities?: string[];
    schemes?: string[];
  }
): Recommendation[] {
  return recommendations.filter(rec => {
    if (filters.villages && filters.villages.length > 0 && !filters.villages.includes(rec.villageId)) {
      return false;
    }
    if (filters.priorities && filters.priorities.length > 0 && !filters.priorities.includes(rec.priority)) {
      return false;
    }
    if (filters.schemes && filters.schemes.length > 0 && !filters.schemes.includes(rec.schemeId)) {
      return false;
    }
    return true;
  });
}