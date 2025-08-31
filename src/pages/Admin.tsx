import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Database, 
  Download, 
  Upload, 
  Users, 
  Settings, 
  RefreshCw,
  Shield,
  Eye,
  FileDown,
  Trash2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export default function Admin() {
  const { role, loading: userLoading, isAdmin, isOfficer } = useUserRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentDataset, setCurrentDataset] = useState('Maharashtra-Demo');

  const handleDatasetLoad = async (dataset: 'Maharashtra-Demo' | 'India-Minimal') => {
    setIsLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCurrentDataset(dataset);
    setIsLoading(false);
    
    toast({
      title: "Dataset Loaded",
      description: `Successfully loaded ${dataset} dataset with mock data.`,
    });
  };

  const handleExport = (type: string) => {
    toast({
      title: "Export Started",
      description: `Generating ${type} export file...`,
    });
  };

  const handleReset = () => {
    toast({
      title: "Data Reset",
      description: "All mock datasets and user preferences have been reset.",
    });
  };

  const layers = [
    { id: 'villages', name: 'Village Boundaries', defaultOpacity: 0.8, visible: true },
    { id: 'ifr', name: 'Individual Forest Rights', defaultOpacity: 0.7, visible: true },
    { id: 'cr', name: 'Community Rights', defaultOpacity: 0.7, visible: false },
    { id: 'cfr', name: 'Community Forest Rights', defaultOpacity: 0.7, visible: false },
    { id: 'assets', name: 'Assets', defaultOpacity: 0.9, visible: false },
    { id: 'landuse', name: 'Land Use', defaultOpacity: 0.6, visible: false },
    { id: 'groundwater', name: 'Groundwater Index', defaultOpacity: 0.5, visible: false },
    { id: 'infrastructure', name: 'Infrastructure', defaultOpacity: 0.8, visible: false },
  ];

  const rolePermissions = {
    'Admin': ['full_access', 'data_management', 'user_management', 'exports', 'system_settings'],
    'Dept Officer': ['read_access', 'limited_exports', 'village_details'],
    'NGO': ['read_only', 'basic_exports']
  };

  // Show loading state
  if (userLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">
              System configuration and data management
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Shield className="w-4 h-4" />
            {role || 'User'}
          </Badge>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin panel. Only administrators can view this page.
            </p>
            <Badge variant="secondary" className="gap-2">
              <Shield className="w-4 h-4" />
              Required Role: Admin
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            System configuration and data management
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Shield className="w-4 h-4" />
          {role || 'Admin'}
        </Badge>
      </div>

      <Tabs defaultValue="datasets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="datasets">Data Management</TabsTrigger>
          <TabsTrigger value="layers">Layer Config</TabsTrigger>
          <TabsTrigger value="users">User Roles</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-6">
          {/* Seed Data Loader */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Seed Data Loader
              </CardTitle>
              <CardDescription>
                Load different datasets for demonstration purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className={`cursor-pointer transition-all hover:shadow-md ${
                  currentDataset === 'Maharashtra-Demo' ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Maharashtra Demo</h3>
                      {currentDataset === 'Maharashtra-Demo' && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Comprehensive dataset with Bhamragad and surrounding villages
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                      <li>• 2 villages with detailed claims data</li>
                      <li>• IFR, CR, and CFR polygons</li>
                      <li>• Asset and infrastructure layers</li>
                      <li>• Complete DSS scheme coverage</li>
                    </ul>
                    <Button 
                      onClick={() => handleDatasetLoad('Maharashtra-Demo')}
                      disabled={isLoading || currentDataset === 'Maharashtra-Demo'}
                      className="w-full"
                      variant={currentDataset === 'Maharashtra-Demo' ? 'outline' : 'default'}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Load Dataset'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-all hover:shadow-md ${
                  currentDataset === 'India-Minimal' ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">India Minimal</h3>
                      {currentDataset === 'India-Minimal' && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Minimal dataset for basic functionality testing
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                      <li>• Basic state and district boundaries</li>
                      <li>• Sample village points</li>
                      <li>• Reduced claim data</li>
                      <li>• Core DSS functionality only</li>
                    </ul>
                    <Button 
                      onClick={() => handleDatasetLoad('India-Minimal')}
                      disabled={isLoading || currentDataset === 'India-Minimal'}
                      className="w-full"
                      variant={currentDataset === 'India-Minimal' ? 'outline' : 'default'}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Load Dataset'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reset All Data
                </Button>
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import Custom Dataset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>
                Generate reports and export data for external use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" onClick={() => handleExport('CSV')} className="gap-2">
                  <FileDown className="w-4 h-4" />
                  Claims CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('GeoJSON')} className="gap-2">
                  <Download className="w-4 h-4" />
                  GeoJSON Export
                </Button>
                <Button variant="outline" onClick={() => handleExport('DSS Report')} className="gap-2">
                  <FileDown className="w-4 h-4" />
                  DSS Report
                </Button>
                <Button variant="outline" onClick={() => handleExport('Full Backup')} className="gap-2">
                  <Database className="w-4 h-4" />
                  Full Backup
                </Button>
              </div>
            </CardContent>
          </Card>


        </TabsContent>

        <TabsContent value="layers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layer Manager</CardTitle>
              <CardDescription>
                Configure default layer visibility and opacity settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {layers.map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={layer.visible}
                        id={`layer-${layer.id}`}
                      />
                      <Label htmlFor={`layer-${layer.id}`} className="font-medium">
                        {layer.name}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Opacity: {Math.round(layer.defaultOpacity * 100)}%</span>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Role Management</CardTitle>
              <CardDescription>
                Configure permissions and access levels for different user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(rolePermissions).map(([role, permissions]) => (
                  <div key={role} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">{role}</h3>
                      {userRole === role && <Badge variant="default">Current</Badge>}
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 pl-7">
                      {permissions.map((permission) => (
                        <div key={permission} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm capitalize">
                            {permission.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                    {role !== 'Admin' && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  Current system status and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-medium">v1.0.0-prototype</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Build</span>
                  <span className="text-sm font-medium">2024.01.30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data Refresh</span>
                  <span className="text-sm font-medium">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Dataset</span>
                  <span className="text-sm font-medium">{currentDataset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Map Provider</span>
                  <span className="text-sm font-medium">OpenStreetMap (Fallback)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Actions</CardTitle>
                <CardDescription>
                  Maintenance and diagnostic operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh All Data
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Eye className="w-4 h-4" />
                  View System Logs
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Diagnostics
                </Button>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear All Cache
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}