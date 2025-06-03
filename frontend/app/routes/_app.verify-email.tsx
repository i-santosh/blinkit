import { Link, useActionData, useLoaderData, Form } from "@remix-run/react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import { authAPI } from "~/lib/api";
import Cookies from "js-cookie";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";

interface LoaderData {
  email: string;
  isEmailVerified: boolean;
  full_name?: string;
  token?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");
  
  // Return the token and email if they exist in URL params
  return { token, email };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  
  try {
    const response = await authAPI.sendEmailVerification(email);
    return { success: true, message: "Verification email sent successfully!" };
  } catch (error: any) {
    const errorResponse = error?.response?.data;
    const errorMessage = errorResponse?.message || "Failed to send verification email. Please try again.";
    return { success: false, message: errorMessage };
  }
};

export default function VerifyEmail() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<{ success: boolean; message: string }>();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'failure'>('loading');
  const [userInfo, setUserInfo] = useState<{ email: string; full_name?: string; isEmailVerified: boolean }>({
    email: loaderData.email || "",
    isEmailVerified: false
  });
  
  // Check for token in URL and try to verify email
  useEffect(() => {
    const verifyToken = async (token: string) => {
      try {
        const response = await authAPI.verifyEmail(token);
        if (response.success) {
          setVerificationState('success');
          
          // Update user cookie to reflect verified status
          const userCookie = Cookies.get('user');
          if (userCookie) {
            const user = JSON.parse(userCookie);
            user.isEmailVerified = true;
            Cookies.set('user', JSON.stringify(user), { path: '/', expires: 30 });
          }
        } else {
          setVerificationState('failure');
        }
      } catch (error) {
        setVerificationState('failure');
      }
    };
    
    // Get user info from cookie
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        setUserInfo(prev => ({
          ...prev,
          ...user,
          // If we have an email from URL and no email in cookie, use the URL email
          email: user.email || loaderData.email || prev.email
        }));
        
        // If user is already verified, show success
        if (user.isEmailVerified) {
          setVerificationState('success');
        }
      } catch (e) {
        console.error("Failed to parse user cookie", e);
      }
    } else if (loaderData.email) {
      // If no user cookie but we have email in URL, use that
      setUserInfo(prev => ({ ...prev, email: loaderData.email || "" }));
    }
    
    // If there's a token in the URL, verify it
    if (loaderData.token) {
      verifyToken(loaderData.token);
    } else {
      // If no token but we have user info, just show the prompt screen
      setVerificationState('failure');
    }
  }, [loaderData.token, loaderData.email]);
  
  if (verificationState === 'loading') {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-lg shadow-sm text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-20 w-20 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-8 w-3/4 bg-gray-200 mb-4"></div>
            <div className="h-4 w-full bg-gray-200 mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-200 mb-8"></div>
            <div className="h-10 w-full bg-gray-200 mb-3"></div>
            <div className="h-10 w-full bg-gray-200"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout showSidebar={false}>
      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-lg shadow-sm text-center">
        {verificationState === 'success' ? (
          <>
            <div className="mx-auto w-20 h-20 flex items-center justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Email Verified!</h1>
            <p className="text-gray-800 mb-8">
              Your email <span className="font-medium text-black">{userInfo.email || "N/A"}</span> has been successfully verified. You can now access all features of Blinkit.
            </p>
            <div className="space-y-3">
              <Link to="/">
                <Button className="w-full bg-green-600 hover:bg-green-700">Go to Homepage</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto w-20 h-20 flex items-center justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Verify Your Email</h1>
            
            <div className="flex flex-col items-center justify-center mb-6">
              <span className="mb-1 text-gray-800">Please verify your email address:</span>
              
              <Button variant="outline" className="w-auto border-gray-300 text-green-800 hover:bg-gray-100 hover:border-green-800 my-2">{userInfo.email || ""} </Button>
            </div>
            
            {actionData && (
              <div className={`p-3 mb-4 rounded-md ${actionData.success ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                <span className="font-medium">{actionData.message}</span>
              </div>
            )}
            
            <div className="space-y-3">
              <Form method="post">
                <input type="hidden" name="email" value={userInfo.email} />
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {actionData?.success ? "Resend Verification Email" : "Send Verification Email"}
                </Button>
              </Form>
              <Link to="/">
                <Button variant="outline" className="w-full border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-gray-900 my-2">Continue to Homepage</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
} 