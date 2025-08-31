import { ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Shield } from 'lucide-react';

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'officer';
  fallback?: ReactNode;
}

export function RouteGuard({ children, requiredRole, fallback }: RouteGuardProps) {
  const { role, loading, isAuthenticated } = useUserRole();

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access this page.
            </p>
            <a 
              href="/auth" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Shield className="w-4 h-4" />
              Sign In
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredRole && role !== requiredRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page. Required role: {requiredRole}.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">
                Current role: {role}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
