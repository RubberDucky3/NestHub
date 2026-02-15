import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useHousehold } from "@/hooks/use-households";
import { Loader2 } from "lucide-react";

// Pages
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Shopping from "@/pages/Shopping";
import Calendar from "@/pages/Calendar";
import Notes from "@/pages/Notes";
import Settings from "@/pages/Settings";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";

// Components
import { Sidebar } from "@/components/Sidebar";
import { HouseholdSetup } from "@/components/HouseholdSetup";

function PrivateRoutes() {
  const { data: household, isLoading: isHouseholdLoading, error } = useHousehold();
  
  if (isHouseholdLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated but no household, show setup flow
  if (!household) {
    return <HouseholdSetup />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/shopping" component={Shopping} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/notes" component={Notes} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <PrivateRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
