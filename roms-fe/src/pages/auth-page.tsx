import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  
  // Redirect if user is already logged in
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-neutral-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen flex md:items-center justify-center p-1 bg-gradient-to-br from-primary-50 to-neutral-100">
      <div className="flex w-full max-w-5xl flex-col md:flex-row bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="md:w-1/2 text-black flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-4">Welcome to ROMS - Room Management Service.</h2>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HCMUT_official_logo.png/1188px-HCMUT_official_logo.png"
              className="w-32 h-auto mx-auto block pb-5 pt-5" 
              />
            <p className="align-middle text-center mb-6"> Ho Chi Minh University of Technology.
            </p>
            
            {/*
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1 bg-white/10 rounded mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Share Your Ideas</h3>
                  <p className="text-sm text-white/80">Create articles with rich formatting and images.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1 bg-white/10 rounded mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Build Your Audience</h3>
                  <p className="text-sm text-white/80">Connect with readers who share your interests.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1 bg-white/10 rounded mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Safety and Privacy</h3>
                  <p className="text-sm text-white/80">Your data is secure and your privacy is respected.</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      
        <div className="md:w-1/2 flex items-center justify-center">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
