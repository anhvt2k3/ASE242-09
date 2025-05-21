import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { UserNav } from "@/components/ui/user-nav";
import { Shield, User } from "lucide-react";

export function Navbar() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  
  // Add this function
  const enableTestMode = () => {
    // This is a sample JWT format with a fake signature - for development only
    const fakeJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikd1ZXN0IFVzZXIiLCJyb2xlIjoiTEVDVFVSRVIiLCJpYXQiOjE1MTYyMzkwMjJ9.fake_signature";
    localStorage.setItem('token', fakeJwt);
    window.location.reload();
  };
  
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-xl font-bold text-primary cursor-pointer">ROMs</h1>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {user?.isAdmin && (
                <Link 
                  href="/admin" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === "/admin" 
                      ? "border-primary text-gray-900" 
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user?.isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => navigate("/admin")}
              >
                <Shield className="h-4 w-4" />
                <span>Manage</span>
              </Button>
            )}
            {user ? (
              <UserNav />
            ) : (
              <>
                {/* Add Test Mode button here */}
                <Button 
                  variant="outline" 
                  onClick={enableTestMode}
                  className="mr-2"
                >
                  <User className="h-4 w-4 mr-2" />
                  Test Mode
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  Log in
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}