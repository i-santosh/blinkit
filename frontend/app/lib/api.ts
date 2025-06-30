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
  shipping_address?: string;
  payment_id?: string;
  formatted_status?: string;
  payment_method?: string;
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
  createOrder: async (orderData: { 
    orderItem: { product_id: number; quantity: number }[], 
    payment_method: string,
    shipping_address?: string 
  }) => {
    try {
      const response = await apiClient.post('/orders/place/', orderData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },

  verifyPayment: async (paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }) => {
    try {
      const response = await apiClient.post('/orders/verify-payment/', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Error verifying payment:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },
  
  getOrders: async () => {
    try {
      const response = await apiClient.get('/orders/my-orders/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },
  
  getOrderDetails: async (orderId: string) => {
    try {
      const response = await apiClient.get(`/orders/order/${orderId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order details:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },

  cancelOrder: async (orderId: string) => {
    try {
      const response = await apiClient.post(`/orders/order/${orderId}/cancel/`);
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling order:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },
};

// Contact API
export const contactAPI = {
  sendMessage: async (data: ContactData) => {
    const response = await apiClient.post<ApiResponse<ContactData>>('/contact/', data);
    return response.data;
  },
};

// Delivery Areas API
export const deliveryAreasAPI = {
  getActiveAreas: async () => {
    try {
      const response = await apiClient.get('/addresses/delivery-areas/active_areas/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching active delivery areas:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },

  createDeliveryArea: async (areaData: {
    city: string;
    state: string;
    pin_code: string;
    is_active?: boolean;
    delivery_charges?: number;
    estimated_delivery_days?: number;
  }) => {
    try {
      const response = await apiClient.post('/addresses/delivery-areas/', areaData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating delivery area:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },

  updateDeliveryArea: async (areaId: number, areaData: {
    city?: string;
    state?: string;
    pin_code?: string;
    is_active?: boolean;
    delivery_charges?: number;
    estimated_delivery_days?: number;
  }) => {
    try {
      const response = await apiClient.patch(`/addresses/delivery-areas/${areaId}/`, areaData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating delivery area:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },

  deleteDeliveryArea: async (areaId: number) => {
    try {
      const response = await apiClient.delete(`/addresses/delivery-areas/${areaId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting delivery area:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },

  // Fetch list of serviceable pincodes
  getPincodes: async () => {
    try {
      const response = await apiClient.get('/addresses/pincodes/');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      return [];
    }
  },

  // Check if a specific pincode is serviceable
  checkPincode: async (pincode: string) => {
    try {
      const response = await apiClient.get(`/addresses/check-pincode/?pincode=${pincode}`);
      return response.data.data.serviceable;
    } catch (error) {
      console.error('Error checking pincode:', error);
      return false;
    }
  }
};