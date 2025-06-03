import axios from 'axios';
import { getAccessTokenCookie, getRefreshTokenCookie } from '../../utils/token/get-token';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_ROOT_URL || 'https://bossbackend.pythonanywhere.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = getAccessTokenCookie();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshTokenCookie();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
          refresh: refreshToken,
        });

        if (response.data.success) {
          const { access } = response.data.data;
          
          // Update client-side cookie with the new token
          Cookies.set('access', access.value, {
            expires: new Date(access.expires),
            secure: window.location.protocol === 'https:',
            sameSite: 'lax'
          });
          
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access.value}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        } else {
          // If refresh token fails with an error response, redirect to login
          window.location.href = '/signin';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If refresh token fails with an exception, redirect to login
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

