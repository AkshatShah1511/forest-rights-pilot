import { useState } from "react";
import { 
  BarChart3, 
  Map, 
  Building2, 
  Brain, 
  FileText, 
  Settings, 
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "FRA Atlas", url: "/atlas", icon: Map },
  { title: "Decision Support", url: "/dss", icon: Brain },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Admin", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };
  
  const getNavClassName = (active: boolean) =>
    active 
      ? "bg-primary text-primary-foreground font-medium shadow-soft" 
      : "hover:bg-accent hover:text-accent-foreground transition-smooth";

  return (
    <Sidebar className="border-r border-border bg-gradient-card">
      <SidebarContent>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Map className="w-4 h-4 text-white" />
            </div>
            {state === "expanded" && (
              <div>
                <h2 className="font-bold text-foreground">FRA Atlas</h2>
                <p className="text-xs text-muted-foreground">Prototype v1.0</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(isActive(item.url))}
                    >
                      <item.icon className="w-4 h-4" />
                      {state === "expanded" && <span>{item.title}</span>}
                      {state === "expanded" && isActive(item.url) && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HelpCircle className="w-4 h-4" />
                  {state === "expanded" && <span>Help & Tour</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}