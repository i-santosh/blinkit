import { useEffect, useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { authAPI } from "~/lib/api";
import { toast } from "react-fox-toast";
import { Layout } from "~/components/layout";
import useUserProfileStore from "~/store/userProfileStore";

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, setUserProfile } = useUserProfileStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authAPI.getProfile();
        
        if (response.success) {
          setUserProfile(response.data);
        } else {
          setError("Failed to load profile data.");
          toast.error("Failed to load profile data.");
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile. Please try again later.");
        toast.error("Failed to load profile. Please try again later.");
        // If unauthorized, redirect to signin
        if (error.response?.status === 401) {
          navigate("/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [setUserProfile, navigate]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account information
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        ) : userProfile ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="mt-1 p-2 border border-gray-200 rounded-md bg-white text-gray-800">
                      {userProfile.full_name}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 p-2 border border-gray-200 rounded-md bg-white text-gray-800 flex items-center justify-between">
                      <span>{userProfile.email}</span>
                      {userProfile.is_email_verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {userProfile.contact_number ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                      <div className="mt-1 p-2 border border-gray-200 rounded-md bg-white text-gray-800">
                        {userProfile.contact_number}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Account Management</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-900">Update Your Profile</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Change your personal information
                    </p>
                    <button 
                      onClick={() => navigate("/edit-profile")}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Edit Profile
                    </button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-900">Password Management</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Change your account password
                    </p>
                    <button 
                      onClick={() => navigate("/change-password")}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Change Password
                    </button>
                  </div>
                  
                  {!userProfile.is_email_verified && (
                    <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                      <h3 className="font-medium text-yellow-800">Verify Your Email</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your email address has not been verified yet. Please check your inbox for a verification link or request a new one.
                      </p>
                      <button 
                        onClick={async () => {
                          try {
                            const response = await authAPI.sendEmailVerification(userProfile.email);
                            if (response.success) {
                              toast.success("Verification email sent successfully!");
                            }
                          } catch (error) {
                            toast.error("Failed to send verification email. Please try again later.");
                          }
                        }}
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Resend Verification Email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
            Please sign in to view your profile.
            <div className="mt-2">
              <Link 
                to="/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 