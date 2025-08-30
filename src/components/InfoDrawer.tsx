import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  MapPin, 
  User, 
  FileText, 
  TrendingUp, 
  Zap,
  ExternalLink,
  Download
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

export function InfoDrawer() {
  const { mapState, setShowInfoDrawer } = useAppStore();
  const navigate = useNavigate();
  const { showInfoDrawer, selectedFeature } = mapState;

  const { data: claims } = useQuery({
    queryKey: ['claims'],
    queryFn: api.fetchClaims
  });

  const { data: villages } = useQuery({
    queryKey: ['villages'],
    queryFn: api.fetchVillages
  });

  if (!showInfoDrawer || !selectedFeature) {
    return null;
  }

  const feature = selectedFeature;
  const properties = feature.properties || {};

  // Find related data
  const relatedClaim = claims?.find((c: any) => c.pattaId === properties.pattaId);
  const relatedVillage = villages?.find((v: any) => 
    v.id === properties.villageId || v.id === relatedClaim?.villageId
  );

  const handleOpenInDSS = () => {
    if (relatedVillage) {
      navigate(`/dss?village=${relatedVillage.id}`);
    }
  };

  const handleViewVillage = () => {
    if (relatedVillage) {
      navigate(`/village/${relatedVillage.id}`);
    }
  };

  const getFeatureTitle = () => {
    if (properties.pattaId) return properties.pattaId;
    if (properties.name) return properties.name;
    if (properties.assetType) return `${properties.assetType}: ${properties.name || 'Unnamed'}`;
    return 'Map Feature';
  };

  const getFeatureType = () => {
    if (properties.pattaId) {
      if (properties.pattaId.includes('IFR')) return 'Individual Forest Rights';
      if (properties.pattaId.includes('CFR')) return 'Community Forest Rights';
      if (properties.pattaId.includes('CR')) return 'Community Rights';
    }
    if (properties.assetType) return properties.assetType;
    return 'Unknown';
  };

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-card border-l border-border shadow-strong z-10 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold truncate">{getFeatureTitle()}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowInfoDrawer(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{getFeatureType()}</Badge>
          {properties.status && (
            <Badge variant={
              properties.status === 'Approved' ? 'default' : 
              properties.status === 'Pending' ? 'secondary' : 'destructive'
            }>
              {properties.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="summary" className="h-full">
          <TabsList className="grid w-full grid-cols-4 m-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="fra">FRA Data</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <div className="px-4 pb-4">
            <TabsContent value="summary" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Feature Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {properties.pattaId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Patta ID</span>
                      <span className="text-sm font-medium">{properties.pattaId}</span>
                    </div>
                  )}
                  
                  {relatedClaim && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Holder</span>
                        <span className="text-sm font-medium">{relatedClaim.holder}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Area</span>
                        <span className="text-sm font-medium">{relatedClaim.areaHa} ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Coordinates</span>
                        <span className="text-sm font-mono">{relatedClaim.coords.join(', ')}</span>
                      </div>
                    </>
                  )}

                  {properties.assetType && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Asset Type</span>
                        <span className="text-sm font-medium">{properties.assetType}</span>
                      </div>
                      {properties.name && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Name</span>
                          <span className="text-sm font-medium">{properties.name}</span>
                        </div>
                      )}
                    </>
                  )}

                  {relatedVillage && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Village</span>
                        <span className="text-sm font-medium">{relatedVillage.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">District</span>
                        <span className="text-sm font-medium">{relatedVillage.districtId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Population</span>
                        <span className="text-sm font-medium">{relatedVillage.population.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {relatedVillage && (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 justify-start"
                      onClick={handleViewVillage}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Village Details
                    </Button>
                  )}
                  
                  {relatedVillage && (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 justify-start"
                      onClick={handleOpenInDSS}
                    >
                      <Zap className="w-4 h-4" />
                      Open in DSS
                    </Button>
                  )}
                  
                  {relatedClaim?.docs && (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 justify-start"
                      onClick={() => navigate('/documents')}
                    >
                      <FileText className="w-4 h-4" />
                      View Documents
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 justify-start"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fra" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">FRA Snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                  {relatedClaim ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type</span>
                          <div className="font-medium">{relatedClaim.type}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status</span>
                          <div className="font-medium">{relatedClaim.status}</div>
                        </div>
                      </div>
                      <Separator />
                      <div className="text-sm">
                        <span className="text-muted-foreground">Documentation</span>
                        <div className="mt-1">
                          {relatedClaim.docs?.map((doc: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <FileText className="w-3 h-3" />
                              <span className="text-xs">{doc.split('/').pop()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No FRA claim data available for this feature.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Associated Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  {relatedVillage ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 border rounded">
                        <div className="text-lg font-bold text-info">{relatedVillage.waterBodiesCount}</div>
                        <div className="text-xs text-muted-foreground">Water Bodies</div>
                      </div>
                      <div className="text-center p-2 border rounded">
                        <div className="text-lg font-bold text-warning">{Math.floor(relatedVillage.agriAreaHa / 5)}</div>
                        <div className="text-xs text-muted-foreground">Farm Plots</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No asset data available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Environmental Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {relatedVillage ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Groundwater Index</span>
                        <span className="text-sm font-medium">
                          {relatedVillage.groundwaterIndex.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Forest Degradation</span>
                        <span className="text-sm font-medium">
                          {(relatedVillage.forestDegradationLevel * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Poverty Score</span>
                        <span className="text-sm font-medium">
                          {(relatedVillage.povertyScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No trend data available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}