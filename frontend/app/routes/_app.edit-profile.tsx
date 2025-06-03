import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { authAPI } from "~/lib/api";
import { toast } from "react-fox-toast";
import { Layout } from "~/components/layout";
import useUserProfileStore from "~/store/userProfileStore";
import type { UserProfile } from "~/lib/api";

export default function EditProfile() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useUserProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: "",
    email: "",
    contact_number: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (userProfile) {
        // If profile is already in state, use it
        setFormData({
          full_name: userProfile.full_name || "",
          email: userProfile.email || "",
          contact_number: userProfile.contact_number || "",
        });
        return;
      }

      // Otherwise fetch from API
      try {
        setIsLoading(true);
        const response = await authAPI.getProfile();
        
        if (response.success) {
          setUserProfile(response.data);
          setFormData({
            full_name: response.data.full_name || "",
            email: response.data.email || "",
            contact_number: response.data.contact_number || "",
          });
        } else {
          toast.error("Failed to load profile data.");
          navigate("/profile");
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile. Please try again later.");
        
        // If unauthorized, redirect to signin
        if (error.response?.status === 401) {
          navigate("/signin");
        } else {
          navigate("/profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userProfile, setUserProfile, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.contact_number && !/^\d+$/.test(String(formData.contact_number))) {
      newErrors.contact_number = "Contact number must contain only digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      
      const response = await authAPI.updateProfile(formData);
      
      if (response.success) {
        setUserProfile(response.data);
        toast.success("Profile updated successfully!");
        navigate("/profile");
      } else {
        toast.error(response.message || "Failed to update profile.");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorResponse = error?.response?.data;
      
      if (errorResponse?.errors) {
        setErrors(errorResponse.errors);
      }
      
      toast.error(errorResponse?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/profile')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Update your personal information
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                  Contact Number (Optional)
                </label>
                <input
                  type="text"
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
                />
                {errors.contact_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
} 