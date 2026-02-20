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
};

export default apiClient;
