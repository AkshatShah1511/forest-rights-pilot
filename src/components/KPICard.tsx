import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  description: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

export function KPICard({ title, value, description, trend, trendDirection = 'up' }: KPICardProps) {
  return (
    <Card className="hover:shadow-medium transition-all duration-300 bg-gradient-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
        <CardDescription className="text-xs">{description}</CardDescription>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            trendDirection === 'up' ? 'text-success' : 'text-destructive'
          }`}>
            {trendDirection === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}