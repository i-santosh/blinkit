import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { clearTokens } from "../../utils/token/get-token";

export default function Logout() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear all tokens
    clearTokens();
    
    // Redirect to signin page
    navigate("/signin", { replace: true });
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Logging out...</p>
    </div>
  );
} 