import apiClient from './client-axios';

// Generic API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  code: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: Record<string, any>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Auth Types
export interface TokenData {
  value: string;
  expires: string;
}

export interface AuthTokens {
  access: TokenData;
  refresh: TokenData;
}

export interface SignUpData {
  full_name: string;
  email: string;
  username: string;
  password: string;
  country: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  username: string;
  contact_number?: string;
  is_email_verified: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  category: number;
  thumbnail: string | null;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  thumbnail: string | null;
}

export interface DealOfTheDay {
  id: number;
  product: Product;
  deal_price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface OrderItemResponse {
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  total_price: number;
  status: string;
  items: OrderItemResponse[];
}

export interface OrderResponse {
  order: Order;
  razorpay_order_id: string;
  razorpay_amount: number;
  currency: string;
}

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Auth API
export const authAPI = {
  signUp: async (data: SignUpData) => {
    const response = await apiClient.post<ApiResponse<AuthTokens & UserProfile>>('/accounts/signup/', data);
    return response.data;
  },

  signIn: async (data: SignInData) => {
    const response = await apiClient.post<ApiResponse<AuthTokens & UserProfile>>('/accounts/signin/', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<{ access: TokenData }>>('/accounts/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/accounts/profile/');
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await apiClient.patch<ApiResponse<UserProfile>>('/accounts/profile/', data);
    return response.data;
  },

  sendEmailVerification: async (email: string) => {
    const response = await apiClient.post<ApiResponse<null>>('/accounts/email/send/', { email });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post<ApiResponse<null>>('/accounts/email/verify/', { token });
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await apiClient.post<ApiResponse<null>>('/accounts/password/change/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post<ApiResponse<null>>('/accounts/password/reset/request/', {
      email,
    });
    return response.data;
  },

  verifyPasswordResetToken: async (token: string) => {
    const response = await apiClient.get<ApiResponse<{ valid: boolean }>>(`/accounts/password/reset/verify-token/?token=${token}`);
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post<ApiResponse<null>>('/accounts/password/reset/', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getProducts: async (page?: number, search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (search) params.append('search', search);
    if (category) {
      console.log("🔍 API call with category parameter:", category);
      params.append('category', category);
    }
    
    const url = `/products/products/?${params.toString()}`;
    console.log("📡 Making API request to:", url);
    
    const response = await apiClient.get<ApiResponse<{
      results: Product[];
      count: number;
      next: string | null;
      previous: string | null;
    }>>(url);
    return response.data;
  },

  getProduct: async (productId: number) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/products/${productId}/`);
    return response.data;
  },

  searchProducts: async (query: string, category?: number) => {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category.toString());
    
    const response = await apiClient.get<ApiResponse<Product[]>>(`/products/products/search/?${params.toString()}`);
    return response.data;
  },

  getDealOfTheDay: async () => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products/products/deal-of-the-day/');
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get<ApiResponse<{
      id: number;
      name: string;
      description: string;
      thumbnail: string | null;
    }[]>>('/products/categories/');
    return response.data;
  },

  getCategory: async (categoryId: number) => {
    const response = await apiClient.get<ApiResponse<{
      id: number;
      name: string;
      description: string;
      thumbnail: string | null;
    }>>(`/products/categories/${categoryId}/`);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  createOrder: async (orderItems: OrderItem[]) => {
    const response = await apiClient.post<ApiResponse<OrderResponse>>('/orders/place/', { orderItem: orderItems });
    return response.data;
  },

  getOrders: async () => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders/');
    return response.data;
  },

  getOrder: async (orderId: number) => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}/`);
    return response.data;
  },
};

// Contact API
export const contactAPI = {
  sendMessage: async (data: ContactData) => {
    const response = await apiClient.post<ApiResponse<ContactData>>('/contact/', data);
    return response.data;
  },
}; 