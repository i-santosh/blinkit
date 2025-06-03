import { useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authAPI } from "~/lib/api";
import { toast } from "react-fox-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      const response = await authAPI.requestPasswordReset(email);
      
      if (response.success) {
        toast.success(response.message);
        setSubmitted(true);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error(error);
      const errorResponse = error?.response?.data;
      toast.error(errorResponse?.message || 'Something went wrong! Please try again.');
      
      if (errorResponse?.errors?.email) {
        setError(errorResponse.errors.email);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout showSidebar={false}>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center mb-6">
          <Link to="/signin" className="mr-4">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
        </div>

        {!submitted ? (
          <>
            <p className="text-gray-700 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  autoComplete="email" 
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="text-gray-800"
                />
                {error && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-700">
                Remember your password?{" "}
                <Link to="/signin" className="text-primary font-medium hover:underline">
                  Back to login
                </Link>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Email Sent</h2>
            <p className="text-gray-700 mb-6">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
            <Link to="/signin">
              <Button variant="outline" className="w-full">Back to Login</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
} 