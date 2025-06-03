import { Link } from "@remix-run/react";
import { Mail } from "lucide-react";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";

export default function VerificationSent() {
  // This email would typically come from form submission or context
  const emailAddress = "user@example.com";

  return (
    <Layout showSidebar={false}>
      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-lg shadow-sm text-center">
        <div className="mx-auto w-20 h-20 flex items-center justify-center mb-6">
          <Mail className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Verification Email Sent</h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification email to:
        </p>
        <p className="font-medium text-lg mb-8">{emailAddress}</p>
        <p className="text-gray-600 mb-8">
          Please check your inbox and click on the verification link to complete your registration.
        </p>
        
        <div className="space-y-3">
          <Button className="w-full">Resend Verification Email</Button>
          <Link to="/login">
            <Button variant="outline" className="w-full">Back to Login</Button>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Didn't receive the email? Check your spam folder or try again with a different email address.</p>
        </div>
      </div>
    </Layout>
  );
} 