import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PriorityBadge } from './PriorityBadge';
import { 
  X, 
  Save, 
  Calendar, 
  Building, 
  IndianRupee, 
  FileText,
  Users,
  MapPin,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface ActionPlannerProps {
  recommendation: Recommendation;
  onClose: () => void;
}

export function ActionPlanner({ recommendation, onClose }: ActionPlannerProps) {
  const { toast } = useToast();
  const [planData, setPlanData] = useState({
    assignedDepartment: '',
    plannedStartDate: '',
    estimatedDuration: '',
    budgetAllocated: recommendation.estimatedBudget.toString(),
    notes: '',
    milestone1: '',
    milestone2: '',
    milestone3: '',
    riskAssessment: 'Low'
  });

  const departments = [
    'Forest Department',
    'Tribal Welfare Department',
    'Rural Development Department',
    'Water Resources Department',
    'Agriculture Department',
    'Panchayati Raj Department'
  ];

  const handleInputChange = (field: string, value: string) => {
    setPlanData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePlan = () => {
    // In a real app, this would save to a backend
    toast({
      title: "Action Plan Saved",
      description: `Plan for ${recommendation.schemeName} in ${recommendation.villageName} has been saved.`,
    });
    
    // Save to localStorage for demo
    const existingPlans = JSON.parse(localStorage.getItem('fra-action-plans') || '[]');
    const newPlan = {
      id: `${recommendation.schemeId}-${recommendation.villageId}-${Date.now()}`,
      recommendation,
      planData,
      createdAt: new Date().toISOString(),
      status: 'Draft'
    };
    existingPlans.push(newPlan);
    localStorage.setItem('fra-action-plans', JSON.stringify(existingPlans));
  };

  const formatBudget = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  const getTimelineFromDuration = (duration: string) => {
    const months = parseInt(duration);
    if (isNaN(months)) return 'Not specified';
    
    const startDate = planData.plannedStartDate ? new Date(planData.plannedStartDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Action Planner</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{recommendation.schemeId}</Badge>
            <PriorityBadge priority={recommendation.priority} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground">{recommendation.schemeName}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {recommendation.villageName}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Quick Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recommendation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{recommendation.affectedHouseholds}</div>
                    <div className="text-xs text-muted-foreground">Households</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatBudget(recommendation.estimatedBudget)}</div>
                    <div className="text-xs text-muted-foreground">Est. Budget</div>
                  </div>
                </div>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                {recommendation.justification}
              </p>
            </CardContent>
          </Card>

          {/* Planning Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Implementation Plan</CardTitle>
              <CardDescription>Configure the action plan details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Department Assignment */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">
                  Assign Department *
                </Label>
                <Select value={planData.assignedDepartment} onValueChange={(value) => handleInputChange('assignedDepartment', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {dept}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Planned Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={planData.plannedStartDate}
                    onChange={(e) => handleInputChange('plannedStartDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium">
                    Duration (months)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="60"
                    value={planData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                    placeholder="6"
                  />
                </div>
              </div>

              {/* Timeline Preview */}
              {planData.estimatedDuration && (
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Timeline:</span>
                    <span className="text-muted-foreground">
                      {getTimelineFromDuration(planData.estimatedDuration)}
                    </span>
                  </div>
                </div>
              )}

              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">
                  Budget Allocated (₹)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={planData.budgetAllocated}
                  onChange={(e) => handleInputChange('budgetAllocated', e.target.value)}
                />
              </div>

              {/* Risk Assessment */}
              <div className="space-y-2">
                <Label htmlFor="risk" className="text-sm font-medium">
                  Risk Assessment
                </Label>
                <Select value={planData.riskAssessment} onValueChange={(value) => handleInputChange('riskAssessment', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Key Milestones</CardTitle>
              <CardDescription>Define major checkpoints for this plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="milestone1" className="text-sm font-medium">
                  Milestone 1 (Initial Setup)
                </Label>
                <Input
                  id="milestone1"
                  value={planData.milestone1}
                  onChange={(e) => handleInputChange('milestone1', e.target.value)}
                  placeholder="e.g., Baseline survey completion"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="milestone2" className="text-sm font-medium">
                  Milestone 2 (Mid-point Review)
                </Label>
                <Input
                  id="milestone2"
                  value={planData.milestone2}
                  onChange={(e) => handleInputChange('milestone2', e.target.value)}
                  placeholder="e.g., 50% beneficiary coverage"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="milestone3" className="text-sm font-medium">
                  Milestone 3 (Completion)
                </Label>
                <Input
                  id="milestone3"
                  value={planData.milestone3}
                  onChange={(e) => handleInputChange('milestone3', e.target.value)}
                  placeholder="e.g., Final evaluation and handover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={planData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional planning notes, special considerations, or coordination requirements..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button onClick={handleSavePlan} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            Save Plan
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Export
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Plans are saved locally for this demo
        </p>
      </div>
    </div>
  );
}