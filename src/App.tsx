import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import { RouteGuard } from "./components/RouteGuard";
import Dashboard from "./pages/Dashboard";
import FRAMap from "./pages/FRAMap";
import Village from "./pages/Village";
import DSS from "./pages/DSS";
import Documents from "./pages/Documents";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={
                  <RouteGuard>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/atlas" element={<FRAMap />} />
                        <Route path="/village/:id" element={<Village />} />
                        <Route path="/dss" element={<DSS />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/admin" element={
                          <RouteGuard requiredRole="admin">
                            <Admin />
                          </RouteGuard>
                        } />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </RouteGuard>
                } />
              </Routes>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
