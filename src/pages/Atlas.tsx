import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Filter, Search, Bookmark, Ruler, RotateCcw } from 'lucide-react';
import { MapContainer } from '@/components/MapContainer';
import { LayerToggle } from '@/components/LayerToggle';
import { InfoDrawer } from '@/components/InfoDrawer';
import { FilterPanel } from '@/components/FilterPanel';
import { useAppStore } from '@/store/appStore';

export default function Atlas() {
  const [showFilters, setShowFilters] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
  const { mapState } = useAppStore();

  const layers = [
    { id: 'villages', name: 'Village Boundaries', color: 'hsl(var(--village-color))', active: true },
    { id: 'ifr', name: 'Individual Forest Rights', color: 'hsl(var(--ifr-color))', active: true },
    { id: 'cr', name: 'Community Rights', color: 'hsl(var(--cr-color))', active: false },
    { id: 'cfr', name: 'Community Forest Rights', color: 'hsl(var(--cfr-color))', active: false },
    { id: 'assets', name: 'Assets (Ponds, Farms)', color: 'hsl(var(--info))', active: false },
    { id: 'landuse', name: 'Land Use', color: 'hsl(var(--accent))', active: false },
    { id: 'groundwater', name: 'Groundwater Index', color: 'hsl(var(--info))', active: false },
    { id: 'infrastructure', name: 'Infrastructure', color: 'hsl(var(--secondary))', active: false },
  ];

  return (
    <div className="h-full flex relative">
      {/* Left Sidebar - Layers & Filters */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">FRA Atlas</h2>
            <Badge variant="outline">Interactive</Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={showLayers ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLayers(true)}
              className="flex-1 gap-2"
            >
              <Layers className="w-4 h-4" />
              Layers
            </Button>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(true)}
              className="flex-1 gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {showLayers && (
            <div className="p-4 space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Map Layers
              </h3>
              {layers.map((layer) => (
                <LayerToggle
                  key={layer.id}
                  layer={layer}
                />
              ))}
            </div>
          )}
          
          {showFilters && (
            <FilterPanel />
          )}
        </div>

        {/* Map Tools */}
        <div className="p-4 border-t border-border space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Map Tools
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Ruler className="w-4 h-4" />
              Measure
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Bookmark
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Search className="w-4 h-4" />
              Find Place
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset View
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer />
        
        {/* Map Legend */}
        <Card className="absolute bottom-4 left-4 p-3 shadow-medium">
          <h4 className="font-medium mb-2 text-sm">Legend</h4>
          <div className="space-y-1">
            {layers
              .filter(layer => mapState.selectedLayers.includes(layer.id))
              .map((layer) => (
                <div key={layer.id} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: layer.color }}
                  />
                  <span>{layer.name}</span>
                </div>
              ))}
          </div>
        </Card>

        {/* Base Map Toggle */}
        <div className="absolute top-4 right-4">
          <Card className="p-2">
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="px-3 py-1 text-xs">
                Satellite
              </Button>
              <Button variant="default" size="sm" className="px-3 py-1 text-xs">
                Street
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Info Drawer */}
      <InfoDrawer />
    </div>
  );
}