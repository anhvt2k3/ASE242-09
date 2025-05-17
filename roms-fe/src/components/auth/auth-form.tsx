import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";

// Login schema
const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
});

// Registration schema with password confirmation
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginCreds = {username: string, password: string};

export function AuthForm() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation, guestLoginMutation } = useAuth();
  const [_, navigate] = useLocation();
  const [rememberedCreds, setRememberedCreds] = useState<LoginCreds>({username: localStorage.getItem('rememberedUsername')||"", password: localStorage.getItem('rememberedPassword')||""});
  const [rememberMe, setRememberMe] = useState<boolean>(rememberedCreds.username!="" || rememberedCreds.password!="");
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: rememberedCreds.username,
      password: rememberedCreds.password,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      displayName: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });

    if (rememberMe) {
      localStorage.setItem('rememberedUsername', data.username);
      localStorage.setItem('rememberedPassword', data.password);
    } else {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberedPassword');
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  const handleGuestLogin = () => {
    guestLoginMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/home"); // Redirect to an article
      },
      onError: () => {
        // Handle error if needed
        navigate("/home"); 
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">ROMS</h1>
        <p className="text-muted-foreground">HCMUT Central portal for lecture schedules.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* # Add password format checker here */}
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <a href="#" className="text-sm text-primary hover:text-primary/90">
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <label>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
                className="mr-2 mt-2"
              />
              Remember me
              </label>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
          
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full mt-6"
            onClick={handleGuestLogin}
            disabled={guestLoginMutation.isPending}
          >
            {guestLoginMutation.isPending ? "Continuing..." : "Continue as guest"}
          </Button>
        </TabsContent>
        
        <TabsContent value="register">
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                    <Input
                      placeholder="Your name (optional)"
                      {...field}
                      value={field.value ?? ''} // Ensure value is never null
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full mt-2" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
