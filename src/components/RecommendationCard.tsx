import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PriorityBadge } from './PriorityBadge';
import { 
  MapPin, 
  Users, 
  IndianRupee, 
  FileText, 
  Plus, 
  CheckCircle,
  Eye
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface Recommendation {
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

interface RecommendationCardProps {
  recommendation: Recommendation;
  onSelect: () => void;
  isSelected: boolean;
}

export function RecommendationCard({ recommendation, onSelect, isSelected }: RecommendationCardProps) {
  const { plannedRecommendations, addToPlans, removeFromPlans } = useAppStore();
  const isPlanned = plannedRecommendations.includes(
    `${recommendation.schemeId}-${recommendation.villageId}`
  );

  const handleAddToPlan = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = `${recommendation.schemeId}-${recommendation.villageId}`;
    if (isPlanned) {
      removeFromPlans(id);
    } else {
      addToPlans(id);
    }
  };

  const formatBudget = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-medium ${
        isSelected ? 'ring-2 ring-primary shadow-medium' : ''
      } ${isPlanned ? 'bg-success-light border-success' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">{recommendation.schemeName}</CardTitle>
              <PriorityBadge priority={recommendation.priority} size="sm" />
            </div>
            <CardDescription className="flex items-center gap-1 text-sm">
              <MapPin className="w-3 h-3" />
              {recommendation.villageName}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-1">
            {isPlanned && <CheckCircle className="w-4 h-4 text-success" />}
            <Badge variant="outline" className="text-xs">
              Score: {recommendation.score}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Justification */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {recommendation.justification}
        </p>

        {/* Evidence */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Supporting Evidence:</h4>
          <div className="space-y-1">
            {recommendation.evidence.map((evidence, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">{evidence}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Impact & Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              Affected Households
            </div>
            <div className="text-sm font-semibold">{recommendation.affectedHouseholds.toLocaleString()}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <IndianRupee className="w-3 h-3" />
              Estimated Budget
            </div>
            <div className="text-sm font-semibold">{formatBudget(recommendation.estimatedBudget)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant={isPlanned ? "default" : "outline"}
            size="sm"
            onClick={handleAddToPlan}
            className="flex-1 gap-1"
          >
            {isPlanned ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Planned
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                Add to Plan
              </>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="gap-1"
          >
            <Eye className="w-3 h-3" />
            Details
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => e.stopPropagation()}
            className="gap-1"
          >
            <FileText className="w-3 h-3" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}