const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface ApiError {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        // Refresh token is invalid, clear everything
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return null;
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    }
  }

  private async handleResponse<T>(response: Response, retryRequest?: () => Promise<Response>): Promise<T> {
    // Handle 401 - try to refresh token
    if (response.status === 401 && retryRequest && !this.isRefreshing) {
      this.isRefreshing = true;
      
      try {
        // Refresh the token
        const newToken = await this.refreshAccessToken();
        
        if (newToken) {
          // Retry the original request with new token
          const retryResponse = await retryRequest();
          this.isRefreshing = false;
          
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      } finally {
        this.isRefreshing = false;
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      // Handle authentication errors (401 status)
      if (response.status === 401) {
        const errorMessage = errorData?.error || errorData?.detail || 'Session expired. Please login again.';
        throw new Error(errorMessage);
      }
      
      // Handle validation errors (400 status) - Django DRF format
      if (response.status === 400 && errorData && typeof errorData === 'object') {
        // Check for non_field_errors first (common DRF pattern)
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          throw new Error(errorData.non_field_errors.join(', '));
        }
        
        // DRF returns errors as { field: [error1, error2], ... }
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          })
          .join('\n');
        throw new Error(errorMessages || 'Validation error');
      }
      
      // Handle other errors
      const error: ApiError = errorData || { message: 'An error occurred' };
      throw new Error(error.message || error.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
  }

  async post<T>(endpoint: string, data?: any, includeAuth = true): Promise<T> {
    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
  }

  async put<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
  }

  async patch<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
  }

  async postFormData<T>(endpoint: string, formData: FormData, includeAuth = true): Promise<T> {
    // Don't set Content-Type — browser sets it with correct boundary for multipart
    const makeRequest = () => {
      const headers: HeadersInit = {};
      if (includeAuth && typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      return fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
    };
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
  }

  async patchFormData<T>(endpoint: string, formData: FormData, includeAuth = true): Promise<T> {
    const makeRequest = () => {
      const headers: HeadersInit = {};
      if (includeAuth && typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      return fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: formData,
      });
    };
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
  }
}

const apiClient = new ApiClient(API_URL);

// Authentication API
export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    user_type?: string;
    phone_number?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  }) => apiClient.post('/users/register/', data, false),

  login: (username: string, password: string) =>
    apiClient.post<{
      message: string;
      user: any;
      tokens: { access: string; refresh: string };
    }>('/users/login/', { username, password }, false),

  logout: (refreshToken: string) =>
    apiClient.post('/users/logout/', { refresh: refreshToken }),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{ access: string }>('/users/token/refresh/', {
      refresh: refreshToken,
    }, false),

  getProfile: () => apiClient.get('/users/profile/'),

  updateProfile: (data: any) => apiClient.put('/users/profile/', data),

  changePassword: (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => apiClient.post('/users/change-password/', data),

  requestEmailVerification: (email: string) => 
    apiClient.post('/users/request-email-verification/', { email }, false),
    
  verifyEmailCode: (email: string, code: string) => 
    apiClient.post('/users/verify-email-code/', { email, otp_code: code }, false),
};

// Products API
export const productsApi = {
  list: (params?: {
    search?: string;
    category?: number;
    is_featured?: boolean;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category.toString());
    if (params?.is_featured !== undefined)
      queryParams.append('is_featured', params.is_featured.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const query = queryParams.toString();
    return apiClient.get(`/products/${query ? `?${query}` : ''}`, false);
  },

  get: (slug: string) => apiClient.get(`/products/${slug}/`, false),

  featured: () => apiClient.get('/products/featured/', false),

  byCategory: (categorySlug: string, page?: number) => {
    const query = page ? `?page=${page}` : '';
    return apiClient.get(`/products/by-category/${categorySlug}/${query}`, false);
  },
};

// Categories API
export const categoriesApi = {
  list: () => apiClient.get('/products/categories/', false),
  root: () => apiClient.get('/products/categories/root/', false),
};

// Units API
export const unitsApi = {
  list: () => apiClient.get('/products/units/', false),
  create: (data: { name: string; abbreviation: string }) => apiClient.post('/products/units/', data),
};

// Sizes API
export const sizesApi = {
  list: (params?: { unit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.unit) queryParams.append('unit', params.unit.toString());
    const query = queryParams.toString();
    return apiClient.get(`/products/sizes/${query ? `?${query}` : ''}`, false);
  },
  create: (data: { value: number; unit_id: number; label?: string }) =>
    apiClient.post('/products/sizes/', data),
};

// Admin Products API
export const adminProductsApi = {
  list: (params?: { search?: string; status?: string; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    const query = queryParams.toString();
    return apiClient.get(`/products/${query ? `?${query}` : ''}`);
  },
  get: (slug: string) => apiClient.get(`/products/${slug}/`),
  create: (formData: FormData) => apiClient.postFormData('/products/', formData),
  update: (slug: string, formData: FormData) => apiClient.patchFormData(`/products/${slug}/`, formData),
  delete: (slug: string) => apiClient.delete(`/products/${slug}/`),
  approve: (slug: string) => apiClient.post(`/products/${slug}/approve/`),
  reject: (slug: string, reason: string) => apiClient.post(`/products/${slug}/reject/`, { reason }),
  pending: () => apiClient.get('/products/pending/'),
};

// Vendor Products API
export const vendorProductsApi = {
  mySuggestions: () => apiClient.get('/products/my_suggestions/'),
  suggest: (formData: FormData) => apiClient.postFormData('/products/', formData),
  update: (slug: string, formData: FormData) => apiClient.patchFormData(`/products/${slug}/`, formData),
  suggestSize: (slug: string, data: { product: number; value: string; unit: number; note?: string }) =>
    apiClient.post(`/products/${slug}/suggest_size/`, data),
};

// Admin Size Requests API
export const sizeRequestsApi = {
  list: (status?: string) => apiClient.get(`/products/size-requests/${status ? `?status=${status}` : ''}`),
  approve: (id: number) => apiClient.post(`/products/size-requests/${id}/approve/`),
  reject: (id: number, reason: string) => apiClient.post(`/products/size-requests/${id}/reject/`, { reason }),
};

// Vendor Listings (Inventory) API
export const listingsApi = {
  list: (params?: { search?: string; is_available?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.is_available !== undefined) q.append('is_available', String(params.is_available));
    const qs = q.toString();
    return apiClient.get(`/pricing/listings/${qs ? `?${qs}` : ''}`);
  },
  create: (data: object) => apiClient.post('/pricing/listings/', data),
  update: (id: number, data: object) => apiClient.patch(`/pricing/listings/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/pricing/listings/${id}/`),
};

// Public Listings API (for buyers)
export const publicListingsApi = {
  search: (params: { search?: string; product_slug?: string; size?: number; ordering?: string; lat?: number; lng?: number; radius?: number }) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.product_slug) q.append('product_slug', params.product_slug);
    if (params.size) q.append('size', String(params.size));
    if (params.ordering) q.append('ordering', params.ordering);
    if (params.lat != null) q.append('lat', String(params.lat));
    if (params.lng != null) q.append('lng', String(params.lng));
    if (params.radius != null) q.append('radius', String(params.radius));
    return apiClient.get(`/pricing/public/?${q.toString()}`, false);
  },
};

export const priceHistoryApi = {
  /**
   * Fetch price history records for graphs / ML training.
   * ?product_slug=rice  — history for all listings of a product
   * ?listing_id=42      — history for a specific listing
   * ?include_current=1  — also include current prices as latest data points
   */
  get: (params: { product_slug?: string; listing_id?: number; include_current?: boolean; ordering?: string }) => {
    const q = new URLSearchParams();
    if (params.product_slug) q.append('product_slug', params.product_slug);
    if (params.listing_id) q.append('listing_id', String(params.listing_id));
    if (params.include_current) q.append('include_current', '1');
    if (params.ordering) q.append('ordering', params.ordering);
    return apiClient.get(`/pricing/history/?${q.toString()}`, false);
  },
};

// Vendors API
export const vendorsApi = {
  list: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiClient.get(`/vendors/${query ? `?${query}` : ''}`, true);
  },
  get: (id: string) => apiClient.get(`/vendors/${id}/`, true),
  update: (id: string, data: any) => apiClient.put(`/vendors/${id}/`, data, true),
  partialUpdate: (id: string, data: any) => apiClient.patch(`/vendors/${id}/`, data, true),
};

// Buyers API (Users filtered by CUSTOMER type)
export const buyersApi = {
  list: (params?: any) => {
    const query = new URLSearchParams({ user_type: 'CUSTOMER', ...(params || {}) }).toString();
    return apiClient.get(`/users/${query ? `?${query}` : ''}`, true);
  },
  get: (id: string) => apiClient.get(`/users/${id}/`, true),
  update: (id: string, data: any) => apiClient.put(`/users/${id}/`, data, true),
};

// Orders API
export const ordersApi = {
  list: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiClient.get(`/orders/${query ? `?${query}` : ''}`, true);
  },
  get: (id: string) => apiClient.get(`/orders/${id}/`, true),
  create: (data: any) => apiClient.post('/orders/', data, true),
  updateStatus: (id: string, status: string) => apiClient.patch(`/orders/${id}/`, { status }, true),
};

// Analytics API
export const analyticsApi = {
  getAdminOverview: () => apiClient.get('/analytics/admin/overview/', true),
  getVendorOverview: () => apiClient.get('/analytics/vendor/overview/', true),
};

// Approvals API
export const approvalsApi = {
  listPendingVendors: () => apiClient.get('/vendors/?status=pending', true),
  approveVendor: (id: string) => apiClient.patch(`/vendors/${id}/`, { status: 'active' }, true),
  rejectVendor: (id: string) => apiClient.patch(`/vendors/${id}/`, { status: 'rejected' }, true),
};

// Wishlist API
export const wishlistApi = {
  list: () => apiClient.get('/wishlist/', true),
  add: (productId: number) => apiClient.post('/wishlist/', { product: productId }, true),
  remove: (id: string | number) => apiClient.delete(`/wishlist/${id}/`, true),
};

// Crowdsource API
export const crowdsourceApi = {
  // Crowdsourcer: list own submissions
  listSubmissions: () => apiClient.get<any>('/crowdsource/submissions/', true),
  
  // Crowdsourcer: get submission detail
  getSubmission: (id: number) => apiClient.get<any>(`/crowdsource/submissions/${id}/`, true),
  
  // Crowdsourcer: submit prices with multiple items (accepts FormData for file uploads)
  submitPrices: (data: FormData | {
    latitude?: number;
    longitude?: number;
    address: string;
    city: string;
    state: string;
    photo_1?: string | File;
    photo_2?: string | File;
    photo_3?: string | File;
    items: Array<{
      product?: string;  // slug
      product_name?: string;
      size?: number;  // size ID
      size_value?: number;
      size_unit?: number;  // unit ID
      price: number;
      brand?: string;
    }>;
  }) => apiClient.post('/crowdsource/submissions/', data, true),
};

// Admin Crowdsource API
export const adminCrowdsourceApi = {
  // Admin: list all submissions
  listSubmissions: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiClient.get<any>(`/crowdsource/submissions/${query}`, true);
  },
  
  // Admin: get submission detail
  getSubmission: (id: number) => apiClient.get<any>(`/crowdsource/submissions/${id}/`, true),
  
  // Admin: approve individual item
  approveItem: (itemId: number) => apiClient.post(`/crowdsource/items/${itemId}/approve/`, {}, true),
  
  // Admin: reject individual item
  rejectItem: (itemId: number, reason: string) => 
    apiClient.post(`/crowdsource/items/${itemId}/reject/`, { reason }, true),
};

// Notifications API
export const notificationsApi = {
  // List notifications (unread by default)
  list: (status?: 'unread' | 'read' | 'all') => {
    const query = status ? `?status=${status}` : '?status=unread';
    return apiClient.get<any>(`/notifications/${query}`, true);
  },
  
  // Get unread count
  count: () => apiClient.get<{ count: number }>('/notifications/count/', true),
  
  // Mark single notification as read
  markRead: (id: number) => apiClient.post(`/notifications/${id}/mark-read/`, {}, true),
  
  // Mark all as read
  markAllRead: () => apiClient.post('/notifications/mark-all-read/', {}, true),
};

export default apiClient;
