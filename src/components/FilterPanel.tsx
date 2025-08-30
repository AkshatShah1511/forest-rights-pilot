import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, Filter } from 'lucide-react';
import api from '@/lib/api';
import { useAppStore } from '@/store/appStore';

export function FilterPanel() {
  const { 
    selectedStates, 
    selectedDistricts, 
    selectedVillages,
    setSelectedStates,
    setSelectedDistricts,
    setSelectedVillages 
  } = useAppStore();

  const [claimTypeFilters, setClaimTypeFilters] = useState({
    IFR: false,
    CR: false,
    CFR: false
  });

  const [statusFilters, setStatusFilters] = useState({
    Approved: false,
    Pending: false,
    Rejected: false
  });

  const [yearFilter, setYearFilter] = useState<string>('');

  const { data: states } = useQuery({
    queryKey: ['states'],
    queryFn: api.fetchStates
  });

  const { data: districts } = useQuery({
    queryKey: ['districts'],
    queryFn: api.fetchDistricts
  });

  const { data: villages } = useQuery({
    queryKey: ['villages'],
    queryFn: api.fetchVillages
  });

  const filteredDistricts = districts?.filter((d: any) => 
    selectedStates.length === 0 || selectedStates.includes(d.stateId)
  );

  const filteredVillages = villages?.filter((v: any) => 
    (selectedStates.length === 0 || selectedStates.includes(v.stateId)) &&
    (selectedDistricts.length === 0 || selectedDistricts.includes(v.districtId))
  );

  const handleStateChange = (stateId: string, checked: boolean) => {
    if (checked) {
      setSelectedStates([...selectedStates, stateId]);
    } else {
      setSelectedStates(selectedStates.filter(id => id !== stateId));
      // Clear dependent filters
      setSelectedDistricts([]);
      setSelectedVillages([]);
    }
  };

  const handleDistrictChange = (districtId: string, checked: boolean) => {
    if (checked) {
      setSelectedDistricts([...selectedDistricts, districtId]);
    } else {
      setSelectedDistricts(selectedDistricts.filter(id => id !== districtId));
      // Clear dependent filters
      setSelectedVillages([]);
    }
  };

  const handleVillageChange = (villageId: string, checked: boolean) => {
    if (checked) {
      setSelectedVillages([...selectedVillages, villageId]);
    } else {
      setSelectedVillages(selectedVillages.filter(id => id !== villageId));
    }
  };

  const handleClaimTypeChange = (type: string, checked: boolean) => {
    setClaimTypeFilters(prev => ({ ...prev, [type]: checked }));
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    setStatusFilters(prev => ({ ...prev, [status]: checked }));
  };

  const clearAllFilters = () => {
    setSelectedStates([]);
    setSelectedDistricts([]);
    setSelectedVillages([]);
    setClaimTypeFilters({ IFR: false, CR: false, CFR: false });
    setStatusFilters({ Approved: false, Pending: false, Rejected: false });
    setYearFilter('');
  };

  const getActiveFilterCount = () => {
    return (
      selectedStates.length +
      selectedDistricts.length +
      selectedVillages.length +
      Object.values(claimTypeFilters).filter(Boolean).length +
      Object.values(statusFilters).filter(Boolean).length +
      (yearFilter ? 1 : 0)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAllFilters}
          className="h-6 text-xs gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Clear
        </Button>
      </div>

      {/* Geographic Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Geographic Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* States */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              States ({selectedStates.length} selected)
            </Label>
            <div className="space-y-2">
              {states?.map((state: any) => (
                <div key={state.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`state-${state.id}`}
                    checked={selectedStates.includes(state.id)}
                    onCheckedChange={(checked) => handleStateChange(state.id, !!checked)}
                  />
                  <Label htmlFor={`state-${state.id}`} className="text-sm">
                    {state.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Districts */}
          {selectedStates.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Districts ({selectedDistricts.length} selected)
                </Label>
                <div className="space-y-2">
                  {filteredDistricts?.map((district: any) => (
                    <div key={district.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`district-${district.id}`}
                        checked={selectedDistricts.includes(district.id)}
                        onCheckedChange={(checked) => handleDistrictChange(district.id, !!checked)}
                      />
                      <Label htmlFor={`district-${district.id}`} className="text-sm">
                        {district.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Villages */}
          {selectedDistricts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Villages ({selectedVillages.length} selected)
                </Label>
                <div className="space-y-2">
                  {filteredVillages?.map((village: any) => (
                    <div key={village.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`village-${village.id}`}
                        checked={selectedVillages.includes(village.id)}
                        onCheckedChange={(checked) => handleVillageChange(village.id, !!checked)}
                      />
                      <Label htmlFor={`village-${village.id}`} className="text-sm">
                        {village.name}
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({village.tribes.join(', ')})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Claim Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Claim Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Claim Types */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Claim Type
            </Label>
            <div className="space-y-2">
              {Object.entries(claimTypeFilters).map(([type, checked]) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={checked}
                    onCheckedChange={(checked) => handleClaimTypeChange(type, !!checked)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm">
                    {type} - {
                      type === 'IFR' ? 'Individual Forest Rights' :
                      type === 'CR' ? 'Community Rights' :
                      'Community Forest Rights'
                    }
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Claim Status
            </Label>
            <div className="space-y-2">
              {Object.entries(statusFilters).map(([status, checked]) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={checked}
                    onCheckedChange={(checked) => handleStatusChange(status, !!checked)}
                  />
                  <Label htmlFor={`status-${status}`} className="text-sm flex items-center gap-2">
                    <Badge 
                      variant={
                        status === 'Approved' ? 'default' :
                        status === 'Pending' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {status}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Year Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Year
            </Label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select year..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tribe Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tribal Communities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['Gond', 'Ho', 'Santhal', 'Munda'].map((tribe) => (
            <div key={tribe} className="flex items-center space-x-2">
              <Checkbox id={`tribe-${tribe}`} />
              <Label htmlFor={`tribe-${tribe}`} className="text-sm">
                {tribe}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}