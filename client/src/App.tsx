import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Plan from "@/pages/plan";
import NotFound from "@/pages/not-found";
import OnboardingPage from "@/pages/onboarding";
import { useEffect, useState } from "react";

function Router() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const exists = !!window.localStorage.getItem("userProfile");
      setHasProfile(exists);
    } catch {
      setHasProfile(false);
    }
  }, []);

  if (hasProfile === null) return null; // avoid flicker on first paint
  return (
    <Switch>
      <Route path="/" component={OnboardingPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/plan" component={Plan} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route component={NotFound} />
    </Switch>
  );
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
