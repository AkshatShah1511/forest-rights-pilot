import { useState } from 'react';
import { 
  Search, 
  User, 
  Bell, 
  Moon, 
  Sun,
  Command,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';

export function TopBar() {
  const { userRole, setUserRole } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleChange = async (role: 'Admin' | 'Dept Officer' | 'NGO') => {
    setUserRole(role);
    
    // Update role in database if user is authenticated
    if (user && profile) {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', user.id);
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search villages, patta holders... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 bg-background/80"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hover:bg-accent"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        <Button variant="ghost" size="sm" className="relative hover:bg-accent">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-accent">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{userRole}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleRoleChange('Admin')}
              className={userRole === 'Admin' ? 'bg-accent' : ''}
            >
              <span className="flex items-center gap-2">
                Admin
                {userRole === 'Admin' && <Badge variant="secondary" className="text-xs">Current</Badge>}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleRoleChange('Dept Officer')}
              className={userRole === 'Dept Officer' ? 'bg-accent' : ''}
            >
              <span className="flex items-center gap-2">
                Dept Officer
                {userRole === 'Dept Officer' && <Badge variant="secondary" className="text-xs">Current</Badge>}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleRoleChange('NGO')}
              className={userRole === 'NGO' ? 'bg-accent' : ''}
            >
              <span className="flex items-center gap-2">
                NGO
                {userRole === 'NGO' && <Badge variant="secondary" className="text-xs">Current</Badge>}
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