import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Users, Droplet, TreePine, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataTable } from '@/components/DataTable';

export default function Village() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: villages } = useQuery({
    queryKey: ['villages'],
    queryFn: api.fetchVillages
  });

  const { data: claims } = useQuery({
    queryKey: ['claims'],
    queryFn: api.fetchClaims
  });

  const village = villages?.find((v: any) => v.id === id);
  const villageClaims = claims?.filter((c: any) => c.villageId === id) || [];

  if (!village) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Village Not Found</h1>
          <p className="text-muted-foreground">The requested village could not be found.</p>
        </div>
      </div>
    );
  }

  const approvedClaims = villageClaims.filter(c => c.status === 'Approved').length;
  const pendingClaims = villageClaims.filter(c => c.status === 'Pending').length;
  const rejectedClaims = villageClaims.filter(c => c.status === 'Rejected').length;
  const totalArea = villageClaims.reduce((sum, c) => sum + c.areaHa, 0);

  const landUseData = [
    { name: 'Forest Rights', value: Math.round(totalArea * 0.6), color: 'hsl(var(--success))' },
    { name: 'Agriculture', value: village.agriAreaHa, color: 'hsl(var(--warning))' },
    { name: 'Other', value: Math.round(totalArea * 0.2), color: 'hsl(var(--muted))' }
  ];

  const ndviTrendData = village.ndviSeries.map((value: number, index: number) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
    ndvi: value,
    waterIndex: Math.max(0.1, village.groundwaterIndex + (Math.random() - 0.5) * 0.1)
  }));

  const claimsColumns = [
    { key: 'pattaId', label: 'Patta ID' },
    { key: 'holder', label: 'Holder Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'type', label: 'Claim Type' },
    { key: 'areaHa', label: 'Area (ha)' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{village.name}</h1>
            <Badge variant="outline">{village.stateId}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              District: {village.districtId}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Population: {village.population.toLocaleString()}
            </span>
            <span>Tribes: {village.tribes.join(', ')}</span>
            <span>Last updated: 2 days ago</span>
          </div>
        </div>

        <Button onClick={() => navigate(`/dss?village=${id}`)} className="gap-2">
          <Zap className="w-4 h-4" />
          Run DSS Analysis
        </Button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{villageClaims.length}</div>
            <p className="text-xs text-muted-foreground">
              {approvedClaims} approved, {pendingClaims} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArea.toFixed(1)} ha</div>
            <p className="text-xs text-muted-foreground">
              Across all claim types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplet className="w-4 h-4 text-info" />
              Water Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{village.groundwaterIndex.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {village.groundwaterIndex < 0.4 ? 'Low stress' : 'Adequate'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TreePine className="w-4 h-4 text-success" />
              Forest Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((1 - village.forestDegradationLevel) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Degradation: {(village.forestDegradationLevel * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Land Use Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Land Use Distribution</CardTitle>
            <CardDescription>Area allocation by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={landUseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value} ha`}
                >
                  {landUseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} ha`, 'Area']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Environmental Trends</CardTitle>
            <CardDescription>NDVI and water index over 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ndviTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="ndvi" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="NDVI"
                />
                <Line 
                  type="monotone" 
                  dataKey="waterIndex" 
                  stroke="hsl(var(--info))" 
                  strokeWidth={2}
                  name="Water Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="claims">Patta Holders</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="issues">Issues & Overlaps</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patta Holders</CardTitle>
              <CardDescription>
                Detailed list of all forest rights claims in {village.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={villageClaims}
                columns={claimsColumns}
                searchKey="holder"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Village Assets</CardTitle>
              <CardDescription>
                Ponds, farms, and other community assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-info">{village.waterBodiesCount}</div>
                  <div className="text-sm text-muted-foreground">Water Bodies</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-warning">{Math.floor(village.agriAreaHa / 5)}</div>
                  <div className="text-sm text-muted-foreground">Farm Plots</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-success">{village.homesteadCount}</div>
                  <div className="text-sm text-muted-foreground">Homesteads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issues & Overlaps</CardTitle>
              <CardDescription>
                Data quality issues and boundary overlaps detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-warning-light">
                  <div className="w-2 h-2 rounded-full bg-warning mt-2" />
                  <div>
                    <h4 className="font-medium">Potential Boundary Overlap</h4>
                    <p className="text-sm text-muted-foreground">
                      IFR claim IFR-MH-0001 may overlap with nearby CFR boundary. Requires field verification.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-info-light">
                  <div className="w-2 h-2 rounded-full bg-info mt-2" />
                  <div>
                    <h4 className="font-medium">Missing GPS Coordinates</h4>
                    <p className="text-sm text-muted-foreground">
                      2 claims lack precise GPS coordinates. Consider resurvey during next field visit.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}