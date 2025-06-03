import { getAccessTokenCookie, getRefreshTokenCookie } from "../../utils/token/get-token";
import verifyToken from "../../utils/token/verify-token";
import { authAPI } from "./api";
import Cookies from 'js-cookie';

export default async function isAuthenticated(): Promise<boolean> {
    const accessToken = getAccessTokenCookie();
    if (!accessToken) return false;

    try {
        const isValid = await verifyToken(accessToken);
        if (!isValid) {
            const refreshToken = getRefreshTokenCookie();
            if (!refreshToken) return false;

            // Try to refresh the token
            const response = await authAPI.refreshToken(refreshToken);
            return response.success && !!response.data.access;
        }
        return true;
    } catch (error) {
        console.error("Authentication error:", error);
        return false;
    }
}

export async function login(email: string, password: string) {
    try {
        const response = await authAPI.signIn({ email, password });
        
        if (response.success) {
            // Set access token cookie
            Cookies.set('access', response.data.access.value, {
                expires: new Date(response.data.access.expires),
                secure: true,
                sameSite: 'strict'
            });

            // Set refresh token cookie
            Cookies.set('refresh', response.data.refresh.value, {
                expires: new Date(response.data.refresh.expires),
                secure: true,
                sameSite: 'strict'
            });
            
            return {
                success: true,
                message: response.message
            };
        }
        
        return {
            success: false,
            message: response.message
        };
    } catch (error: any) {
        console.error("Login error:", error);
        const errResponse = error?.response?.data;
        return {
            success: false,
            message: errResponse?.message || 'Something went wrong! Please try again.'
        };
    }
}

export function logout() {
    // Navigate to the server-side logout route which will clear HttpOnly cookies
    window.location.href = "/logout";
}

export async function getCurrentUser() {
    try {
        const response = await authAPI.getProfile();
        return response.success ? response.data : null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}