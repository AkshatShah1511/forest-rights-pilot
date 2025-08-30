import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { generateRecommendations, filterRecommendations } from '@/lib/dss';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PriorityBadge } from '@/components/PriorityBadge';
import { RecommendationCard } from '@/components/RecommendationCard';
import { ActionPlanner } from '@/components/ActionPlanner';
import { 
  Filter, 
  Zap, 
  Download, 
  Plus, 
  Target,
  Droplet,
  Wheat,
  TreePine,
  TrendingUp
} from 'lucide-react';

export default function DSS() {
  const [searchParams] = useSearchParams();
  const preselectedVillage = searchParams.get('village');
  
  const [filters, setFilters] = useState({
    states: [] as string[],
    districts: [] as string[],
    villages: preselectedVillage ? [preselectedVillage] : [] as string[],
    priorities: [] as string[],
    schemes: [] as string[],
    criteria: {
      lowWater: false,
      hasAgriculture: false,
      forestDegradation: false,
      highPoverty: false
    }
  });

  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);

  const { data: villages } = useQuery({
    queryKey: ['villages'],
    queryFn: api.fetchVillages
  });

  const { data: schemes } = useQuery({
    queryKey: ['schemes'],
    queryFn: api.fetchSchemes
  });

  const { data: states } = useQuery({
    queryKey: ['states'],
    queryFn: api.fetchStates
  });

  // Generate recommendations
  const recommendations = useMemo(() => {
    if (!villages || !schemes) return [];
    
    let filteredVillages = villages;
    
    // Apply criteria filters
    if (filters.criteria.lowWater) {
      filteredVillages = filteredVillages.filter((v: any) => v.groundwaterIndex < 0.4);
    }
    if (filters.criteria.hasAgriculture) {
      filteredVillages = filteredVillages.filter((v: any) => v.agriAreaHa >= 50);
    }
    if (filters.criteria.forestDegradation) {
      filteredVillages = filteredVillages.filter((v: any) => v.forestDegradationLevel >= 0.5);
    }
    if (filters.criteria.highPoverty) {
      filteredVillages = filteredVillages.filter((v: any) => v.povertyScore >= 0.5);
    }

    const allRecommendations = generateRecommendations(filteredVillages, schemes);
    
    return filterRecommendations(allRecommendations, {
      villages: filters.villages,
      priorities: filters.priorities,
      schemes: filters.schemes
    });
  }, [villages, schemes, filters]);

  const groupedRecommendations = useMemo(() => {
    const grouped = {
      High: recommendations.filter(r => r.priority === 'High'),
      Medium: recommendations.filter(r => r.priority === 'Medium'),
      Low: recommendations.filter(r => r.priority === 'Low')
    };
    return grouped;
  }, [recommendations]);

  const updateCriteriaFilter = (key: string, value: boolean) => {
    setFilters(prev => ({
      ...prev,
      criteria: { ...prev.criteria, [key]: value }
    }));
  };

  const toggleVillageFilter = (villageId: string) => {
    setFilters(prev => ({
      ...prev,
      villages: prev.villages.includes(villageId)
        ? prev.villages.filter(id => id !== villageId)
        : [...prev.villages, villageId]
    }));
  };

  const togglePriorityFilter = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }));
  };

  return (
    <div className="h-full flex">
      {/* Left Filter Panel */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Decision Support</h2>
              <p className="text-xs text-muted-foreground">Scheme Recommendations</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Criteria Filters */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Eligibility Criteria
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowWater"
                    checked={filters.criteria.lowWater}
                    onCheckedChange={(checked) => updateCriteriaFilter('lowWater', !!checked)}
                  />
                  <label htmlFor="lowWater" className="text-sm flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-info" />
                    Low Water Index (&lt; 0.4)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAgriculture"
                    checked={filters.criteria.hasAgriculture}
                    onCheckedChange={(checked) => updateCriteriaFilter('hasAgriculture', !!checked)}
                  />
                  <label htmlFor="hasAgriculture" className="text-sm flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-warning" />
                    Has Agriculture (&gt; 50 ha)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="forestDegradation"
                    checked={filters.criteria.forestDegradation}
                    onCheckedChange={(checked) => updateCriteriaFilter('forestDegradation', !!checked)}
                  />
                  <label htmlFor="forestDegradation" className="text-sm flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-success" />
                    Forest Degradation (High)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="highPoverty"
                    checked={filters.criteria.highPoverty}
                    onCheckedChange={(checked) => updateCriteriaFilter('highPoverty', !!checked)}
                  />
                  <label htmlFor="highPoverty" className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-destructive" />
                    High Poverty Score (&gt; 50%)
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Village Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Villages ({filters.villages.length} selected)
              </h3>
              
              <div className="space-y-2">
                {villages?.map((village: any) => (
                  <div key={village.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={village.id}
                      checked={filters.villages.includes(village.id)}
                      onCheckedChange={() => toggleVillageFilter(village.id)}
                    />
                    <label htmlFor={village.id} className="text-sm flex-1">
                      {village.name}
                      <span className="text-muted-foreground ml-1">({village.stateId})</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Priority Filter */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Priority Levels
              </h3>
              
              <div className="space-y-2">
                {['High', 'Medium', 'Low'].map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={priority}
                      checked={filters.priorities.includes(priority)}
                      onCheckedChange={() => togglePriorityFilter(priority)}
                    />
                    <label htmlFor={priority} className="text-sm flex items-center gap-2">
                      <PriorityBadge priority={priority as any} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Filter Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => setFilters(prev => ({
              ...prev,
              villages: [],
              priorities: [],
              schemes: [],
              criteria: { lowWater: false, hasAgriculture: false, forestDegradation: false, highPoverty: false }
            }))}
          >
            <Filter className="w-4 h-4" />
            Clear All Filters
          </Button>
          <Button className="w-full gap-2">
            <Download className="w-4 h-4" />
            Export Filtered Results
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Recommendations List */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Scheme Recommendations</h1>
                <p className="text-muted-foreground">
                  {recommendations.length} recommendations across {new Set(recommendations.map(r => r.villageId)).size} villages
                </p>
              </div>
              
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Bulk Apply to Plan
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {groupedRecommendations.High.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Immediate action required
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    {groupedRecommendations.Medium.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Plan for next quarter
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    {groupedRecommendations.Low.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Long-term consideration
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations by Priority */}
            {['High', 'Medium', 'Low'].map((priority) => (
              <div key={priority} className="space-y-4">
                {groupedRecommendations[priority as keyof typeof groupedRecommendations].length > 0 && (
                  <>
                    <div className="flex items-center gap-3">
                      <PriorityBadge priority={priority as any} />
                      <h2 className="text-xl font-semibold">
                        {priority} Priority ({groupedRecommendations[priority as keyof typeof groupedRecommendations].length})
                      </h2>
                    </div>
                    
                    <div className="grid gap-4">
                      {groupedRecommendations[priority as keyof typeof groupedRecommendations].map((recommendation) => (
                        <RecommendationCard
                          key={`${recommendation.schemeId}-${recommendation.villageId}`}
                          recommendation={recommendation}
                          onSelect={() => setSelectedRecommendation(recommendation)}
                          isSelected={selectedRecommendation?.schemeId === recommendation.schemeId && 
                                    selectedRecommendation?.villageId === recommendation.villageId}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}

            {recommendations.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Adjust your filters to see scheme recommendations for selected villages.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      villages: [],
                      priorities: [],
                      criteria: { lowWater: false, hasAgriculture: false, forestDegradation: false, highPoverty: false }
                    }))}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Planner Sidebar */}
        {selectedRecommendation && (
          <div className="w-80 border-l border-border">
            <ActionPlanner 
              recommendation={selectedRecommendation}
              onClose={() => setSelectedRecommendation(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}