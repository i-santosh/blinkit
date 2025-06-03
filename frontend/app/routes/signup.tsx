import { Form, Link, useActionData, redirect } from "@remix-run/react";
import type { MetaFunction, ActionFunction } from "@remix-run/node";
import { useState } from "react";
import { authAPI } from "~/lib/api";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../../utils/token/get-token";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up | Blinkit" },
    { name: "description", content: "Create a new Blinkit account for grocery delivery." },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const terms = formData.get("terms") === "on";
  
  // Username is generated from email (before the @ symbol)
  const username = email.split('@')[0];
  
  // Validate form
  const errors: Record<string, string> = {};
  
  if (!full_name) errors.full_name = "Full name is required";
  if (!phone) errors.phone = "Phone number is required";
  if (!email) errors.email = "Email is required";
  if (!password) errors.password = "Password is required";
  if (password && password.length < 8) errors.password = "Password must be at least 8 characters";
  if (!terms) errors.terms = "You must agree to the terms and conditions";
  
  if (Object.keys(errors).length > 0) {
    return { errors, fields: { full_name, phone, email } };
  }
  
  try {
    const response = await authAPI.signUp({
      full_name,
      email,
      username,
      password,
      country: "India", // Default country
    });
    
    if (response.success) {
      // Set auth tokens in cookies
      const accessExpiry = new Date(response.data.access.expires).getTime() / 1000 - Date.now() / 1000;
      const refreshExpiry = new Date(response.data.refresh.expires).getTime() / 1000 - Date.now() / 1000;
      
      setAccessTokenCookie(response.data.access.value, accessExpiry);
      setRefreshTokenCookie(response.data.refresh.value, refreshExpiry);
      
      // Return user profile data along with redirect
      return redirect("/verify-email", {
        headers: {
          "Set-Cookie": `user=${JSON.stringify({
            email: email,
            isEmailVerified: false,
            full_name: full_name
          })}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
        },
      });
    } else {
      return { 
        error: response.message,
        fields: { full_name, phone, email }
      };
    }
  } catch (error: any) {
    const errorResponse = error?.response?.data;
    const errorMessage = errorResponse?.message || "Failed to create account. Please try again.";
    const fieldErrors = errorResponse?.errors || {};
    
    // Handle specific error cases
    if (errorResponse?.code === "RES_ALREADY_EXISTS") {
      return {
        error: "An account with this email already exists. Please sign in instead.",
        fields: { full_name, phone, email }
      };
    }
    
    return { 
      error: errorMessage,
      errors: fieldErrors,
      fields: { full_name, phone, email }
    };
  }
};

export default function SignUp() {
  const actionData = useActionData<{ 
    error?: string; 
    errors?: Record<string, string>;
    fields?: { full_name: string; phone: string; email: string; }
  }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">Blinkit</h1>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-black">
          Sign Up
        </h2>
        <div className="mt-3 text-center">
          <p className="text-base font-medium text-black">
            Already have an account?{" "}
            <Link to="/signin" className="font-bold text-primary hover:text-primary-600 underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-300">
          {actionData?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {actionData.error}
            </div>
          )}
          
          <Form className="space-y-6" method="post" onSubmit={() => setIsSubmitting(true)}>
            <div>
              <label htmlFor="full_name" className="block text-base font-bold text-black">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  autoComplete="name"
                  required
                  defaultValue={actionData?.fields?.full_name || ""}
                  placeholder="Enter your full name"
                  className={`appearance-none block w-full px-3 py-3 border ${
                    actionData?.errors?.full_name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-base`}
                />
                {actionData?.errors?.full_name && (
                  <p className="mt-1 text-sm text-red-600">{actionData.errors.full_name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-base font-bold text-black">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  defaultValue={actionData?.fields?.phone || ""}
                  placeholder="Enter your phone number"
                  className={`appearance-none block w-full px-3 py-3 border ${
                    actionData?.errors?.phone ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-base`}
                />
                {actionData?.errors?.phone && (
                  <p className="mt-1 text-sm text-red-600">{actionData.errors.phone}</p>
                )}
              </div>
            </div>

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
                  className={`appearance-none block w-full px-3 py-3 border ${
                    actionData?.errors?.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-base`}
                />
                {actionData?.errors?.email && (
                  <p className="mt-1 text-sm text-red-600">{actionData.errors.email}</p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Your username will be automatically generated from your email
              </p>
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
                  autoComplete="new-password"
                  required
                  placeholder="Create a password (min 8 characters)"
                  className={`appearance-none block w-full px-3 py-3 border ${
                    actionData?.errors?.password ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-base`}
                />
                {actionData?.errors?.password && (
                  <p className="mt-1 text-sm text-red-600">{actionData.errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className={`h-5 w-5 text-primary focus:ring-primary ${
                  actionData?.errors?.terms ? "border-red-500" : "border-gray-300"
                } rounded`}
              />
              <label htmlFor="terms" className="ml-2 block text-sm font-medium text-black">
                I agree to the{" "}
                <a href="/terms" className="font-bold text-primary hover:text-primary-600 underline">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" className="font-bold text-primary hover:text-primary-600 underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {actionData?.errors?.terms && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.terms}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-base font-bold text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
} 