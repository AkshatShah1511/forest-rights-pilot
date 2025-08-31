import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { MapPin, Download, FileUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClaimsStats, useMonthlyTrends } from '@/hooks/useClaims';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const navigate = useNavigate();

  const { stats: kpis, loading: kpisLoading } = useClaimsStats();
  const { trends: monthlyData, loading: trendsLoading } = useMonthlyTrends();

  const dataQualityData = [
    { name: 'Digitized', value: 78, color: 'hsl(var(--success))' },
    { name: 'Legacy', value: 22, color: 'hsl(var(--warning))' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Forest Rights Act implementation overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/atlas')} className="gap-2">
            <MapPin className="w-4 h-4" />
            Open Atlas
          </Button>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpisLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <KPICard 
              title="Total Claims" 
              value={kpis.total.toLocaleString()} 
              description="Across all states"
              trend="+2.3% from last month"
            />
            <KPICard 
              title="Claims Approved" 
              value={`${kpis.approvalRate}%`} 
              description="Approval rate"
              trend="+1.5% from last month"
            />
            <KPICard 
              title="Pending Claims" 
              value={kpis.pending.toLocaleString()} 
              description="Awaiting review"
              trend="+12 new claims"
            />
            <KPICard 
              title="CFR Area" 
              value={`${kpis.totalCFRArea.toLocaleString()} ha`} 
              description="Community forest rights"
              trend="+156 ha approved"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Claims Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Claims Status Distribution</CardTitle>
            <CardDescription>Breakdown of claim statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {kpisLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: kpis.approved, color: 'hsl(var(--success))' },
                      { name: 'Pending', value: kpis.pending, color: 'hsl(var(--warning))' },
                      { name: 'Rejected', value: kpis.rejected, color: 'hsl(var(--destructive))' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Approved', value: kpis.approved, color: 'hsl(var(--success))' },
                      { name: 'Pending', value: kpis.pending, color: 'hsl(var(--warning))' },
                      { name: 'Rejected', value: kpis.rejected, color: 'hsl(var(--destructive))' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Claims']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Processing Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Claims Processed</CardTitle>
            <CardDescription>Processing trend over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="processed" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Data Quality Meter */}
        <Card>
          <CardHeader>
            <CardTitle>Data Quality</CardTitle>
            <CardDescription>Digitized vs legacy records</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataQualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataQualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {dataQualityData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate('/atlas')} 
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <MapPin className="w-4 h-4" />
              Open FRA Atlas
            </Button>
            <Button 
              onClick={() => navigate('/dss')} 
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Zap className="w-4 h-4" />
              Run Decision Support
            </Button>
            <Button 
              className="w-full justify-start gap-2"
              variant="outline"
              disabled
            >
              <FileUp className="w-4 h-4" />
              Upload Legacy Docs
            </Button>
            <Button 
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Export Data (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}