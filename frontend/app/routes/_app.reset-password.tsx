import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "@remix-run/react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authAPI } from "~/lib/api";
import { toast } from "react-fox-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [tokenVerified, setTokenVerified] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetComplete, setResetComplete] = useState(false);
  
  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenChecked(true);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await authAPI.verifyPasswordResetToken(token);
        
        if (response.success && response.data.valid) {
          setTokenVerified(true);
        } else {
          toast.error("Password reset link is invalid or has expired.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to verify reset token. Please try again.");
      } finally {
        setIsLoading(false);
        setTokenChecked(true);
      }
    };
    
    verifyToken();
  }, [token]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      
      if (response.success) {
        toast.success(response.message);
        setResetComplete(true);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error(error);
      const errorResponse = error?.response?.data;
      toast.error(errorResponse?.message || 'Something went wrong! Please try again.');
      
      if (errorResponse?.errors) {
        setErrors(errorResponse.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!tokenChecked) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
          <p className="text-center text-gray-800">Verifying reset link...</p>
        </div>
      </Layout>
    );
  }
  
  if (!token) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Invalid Reset Link</h1>
          <p className="text-gray-700 mb-6">
            The password reset link is missing a token. Please check your email for the correct link or request a new one.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  if (!tokenVerified && tokenChecked) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Invalid or Expired Link</h1>
          <p className="text-gray-700 mb-6">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  if (resetComplete) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Password Reset Complete</h2>
            <p className="text-gray-700 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link to="/signin">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout showSidebar={false}>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center mb-6">
          <Link to="/signin" className="mr-4">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        </div>
        
        <p className="text-gray-700 mb-6">
          Enter your new password below.
        </p>
        
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">
              New Password
            </label>
            <div className="relative">
              <Input 
                id="newPassword" 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter new password" 
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors({...errors, newPassword: ""});
                  }
                }}
                className="text-gray-800"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
              Confirm Password
            </label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors({...errors, confirmPassword: ""});
                }
              }}
              className="text-gray-800"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </Layout>
  );
} 