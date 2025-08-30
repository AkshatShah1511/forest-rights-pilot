import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Info, Settings } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface LayerProps {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

interface LayerToggleProps {
  layer: LayerProps;
}

export function LayerToggle({ layer }: LayerToggleProps) {
  const { mapState, toggleLayer } = useAppStore();
  const [opacity, setOpacity] = useState(70);
  const isActive = mapState.selectedLayers.includes(layer.id);

  const layerDescriptions: Record<string, string> = {
    villages: 'Administrative boundaries of villages with FRA claims',
    ifr: 'Individual Forest Rights - plots allocated to individuals/families',
    cr: 'Community Rights - rights over community forest resources',
    cfr: 'Community Forest Rights - village-level forest management rights',
    assets: 'Community assets like ponds, farms, and other infrastructure',
    landuse: 'Land use classification and patterns',
    groundwater: 'Groundwater availability and stress indicators',
    infrastructure: 'Roads, schools, health centers, and other facilities'
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <Switch
          checked={isActive}
          onCheckedChange={() => toggleLayer(layer.id)}
          id={`layer-${layer.id}`}
        />
        
        <div className="flex items-center gap-2 flex-1">
          <div 
            className="w-4 h-4 rounded-sm border border-border" 
            style={{ backgroundColor: layer.color }}
          />
          <Label 
            htmlFor={`layer-${layer.id}`} 
            className="text-sm font-medium cursor-pointer flex-1"
          >
            {layer.name}
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isActive && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium">Opacity</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[opacity]}
                      onValueChange={(value) => setOpacity(value[0])}
                      max={100}
                      min={0}
                      step={10}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs min-w-[40px]">
                      {opacity}%
                    </Badge>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Info className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{layer.name}</h4>
              <p className="text-xs text-muted-foreground">
                {layerDescriptions[layer.id] || 'Layer description not available.'}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-xs text-muted-foreground">
                  Color: {layer.color}
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}