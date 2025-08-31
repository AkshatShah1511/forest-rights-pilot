import { 
  User, 
  Bell, 
  ChevronDown,
  LogOut
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalSearch } from '@/components/GlobalSearch';

export function TopBar() {
  const { role, updateUserRole } = useUserRole();
  const { user, signOut } = useAuth();

  const handleRoleChange = async (newRole: 'admin' | 'officer') => {
    try {
      await updateUserRole(newRole);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-accent" />
        
        <div className="hidden md:flex items-center gap-2">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FRA Atlas Prototype
          </h1>
          <Badge variant="secondary" className="text-xs">
            Demo
          </Badge>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Button variant="ghost" size="sm" className="relative hover:bg-accent">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-accent">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{role || 'User'}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleRoleChange('admin')}
              className={role === 'admin' ? 'bg-accent' : ''}
            >
              <span className="flex items-center gap-2">
                Admin
                {role === 'admin' && <Badge variant="secondary" className="text-xs">Current</Badge>}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleRoleChange('officer')}
              className={role === 'officer' ? 'bg-accent' : ''}
            >
              <span className="flex items-center gap-2">
                Officer
                {role === 'officer' && <Badge variant="secondary" className="text-xs">Current</Badge>}
              </span>
            </DropdownMenuItem>
            {user && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}