import { Form, Link, useActionData, redirect, useNavigate } from "@remix-run/react";
import type { MetaFunction, ActionFunction } from "@remix-run/node";
import { useState } from "react";
import { authAPI } from "~/lib/api";
import Cookies from "js-cookie";
import React from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign In | Blinkit" },
    { name: "description", content: "Sign in to your Blinkit account." },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rememberMe = formData.get("remember_me") === "on";

  try {
    const response = await authAPI.signIn({ email, password });
    
    if (response.success) {
      // Send tokens in the response for client-side storage
      return {
        success: true,
        tokens: {
          access: response.data.access,
          refresh: response.data.refresh
        },
        user: {
          email,
          isEmailVerified: response.data.is_email_verified || false
        }
      };
    } else {
      return { error: response.message, fields: { email } };
    }
  } catch (error: any) {
    const errorResponse = error?.response?.data;
    const errorMessage = errorResponse?.message || "Invalid login credentials. Please try again.";
    
    // Special case for unverified email
    if (errorResponse?.code === "RES_NOT_FOUND" && email) {
      return { 
        error: errorMessage, 
        emailNotVerified: true,
        fields: { email } 
      };
    }
    
    return { 
      error: errorMessage, 
      fields: { email } 
    };
  }
};

export default function SignIn() {
  const actionData = useActionData<{ 
    success?: boolean;
    tokens?: {
      access: { value: string; expires: string };
      refresh: { value: string; expires: string };
    };
    user?: { email: string; isEmailVerified: boolean };
    error?: string; 
    emailNotVerified?: boolean;
    fields?: { email: string };
  }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Store tokens in cookies when we get a successful response
  React.useEffect(() => {
    if (actionData?.success && actionData.tokens) {
      // Set access token
      Cookies.set('access', actionData.tokens.access.value, {
        expires: new Date(actionData.tokens.access.expires),
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      
      // Set refresh token
      Cookies.set('refresh', actionData.tokens.refresh.value, {
        expires: new Date(actionData.tokens.refresh.expires),
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      
      // Set user info
      Cookies.set('user', JSON.stringify(actionData.user), {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      
      // Redirect to home page
      navigate('/');
    }
  }, [actionData, navigate]);
  
  const handleSendVerification = async () => {
    if (!actionData?.fields?.email) return;
    
    try {
      const response = await authAPI.sendEmailVerification(actionData.fields.email);
      if (response.success) {
        alert("Verification email sent. Please check your inbox.");
      }
    } catch (error) {
      console.error("Failed to send verification email", error);
      alert("Failed to send verification email. Please try again later.");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">Blinkit</h1>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-black">
          Sign In
        </h2>
        <div className="mt-3 text-center">
          <p className="text-base font-medium text-black">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-primary hover:text-primary-600 underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-300">
          {actionData?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {actionData.error}
              
              {actionData.emailNotVerified && actionData.fields?.email && (
                <div className="mt-2">
                  <button 
                    onClick={handleSendVerification}
                    className="text-primary underline font-semibold"
                  >
                    Resend verification email
                  </button>
                </div>
              )}
            </div>
          )}
          
          <Form className="space-y-6" method="post" onSubmit={() => setIsSubmitting(true)}>
            <div>
              <label htmlFor="email" className="block text-base font-bold text-black">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={actionData?.fields?.email || ""}
                  placeholder="Enter your email address"
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-base"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-bold text-black">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-base"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm font-medium text-black">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="font-bold text-primary hover:text-primary-600 underline"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-base font-bold text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
} 