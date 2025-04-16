import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      
      {/* Insert Schedule Listing Page here. *change AuthPage()* */}
      <Route path="/schedules" component={AuthPage} />
      
      {/* Insert Schedule Create here. *change AuthPage()* */}
      <Route path="/schedule-create" component={AuthPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    // Layer of global context for all components
    <QueryClientProvider client={queryClient}> 
    {/* Layer of authentications for any component that need it */}
      <AuthProvider> 
    {/* Layer of client-side endpoints */}
        <Router /> 
    {/* Layer of quick notifications for users of operations */}
        <Toaster /> 
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
