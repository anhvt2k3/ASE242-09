import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import BookingPage from "@/pages/booking-page"; // Import BookingPage
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/home" component={HomePage} />

      {/* Booking Page Route */}
      <Route path="/booking" component={BookingPage} />

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