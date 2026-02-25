const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface ApiError {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;

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

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      // Handle authentication errors (401 status)
      if (response.status === 401 && errorData) {
        const errorMessage = errorData.error || errorData.detail || 'Authentication failed';
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
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });
    return this.handleResponse<T>(response);
  }

  async postFormData<T>(endpoint: string, formData: FormData, includeAuth = true): Promise<T> {
    // Don't set Content-Type — browser sets it with correct boundary for multipart
    const headers: HeadersInit = {};
    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse<T>(response);
  }

  async patchFormData<T>(endpoint: string, formData: FormData, includeAuth = true): Promise<T> {
    const headers: HeadersInit = {};
    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: formData,
    });
    return this.handleResponse<T>(response);
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

export default apiClient;
