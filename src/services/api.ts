import { Report, ReportFilters, PaginatedResponse, ApiResponse, User, LoginRequest, LoginResponse, CreateReportRequest } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<LoginResponse>(response);
    
    if (result.success && result.data) {
      this.token = result.data.token;
      // Store token in localStorage
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }

    return result;
  }

  async register(userData: { username: string; email: string; password: string; full_name: string }): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<User>(response);
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  // Report methods
  async getReports(filters?: ReportFilters): Promise<PaginatedResponse<Report>> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.machineType) params.append('machineType', filters.machineType);
    if (filters?.clientName) params.append('clientName', filters.clientName);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/reports?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<{
      reports: Report[];
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
      };
    }>(response);

    if (result.success && result.data) {
      return {
        data: result.data.reports,
        total: result.data.pagination.totalCount,
        page: result.data.pagination.page,
        limit: result.data.pagination.limit,
        totalPages: result.data.pagination.totalPages,
      };
    }

    throw new Error('Failed to fetch reports');
  }

  async getReport(id: string): Promise<ApiResponse<Report>> {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<Report>(response);
  }

  async createReport(reportData: CreateReportRequest): Promise<ApiResponse<Report>> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(reportData),
    });

    return this.handleResponse<Report>(response);
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<ApiResponse<Report>> {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    return this.handleResponse<Report>(response);
  }

  async deleteReport(id: string): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<boolean>(response);
  }

  // File upload method
  async uploadFiles(files: File[]): Promise<ApiResponse<Array<{
    filename: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
  }>>> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('photos', file);
    });

    const response = await fetch(`${API_BASE_URL}/reports/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return this.handleResponse<Array<{
      filename: string;
      original_name: string;
      file_path: string;
      file_size: number;
      mime_type: string;
    }>>(response);
  }

  // Token management
  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Initialize token from localStorage
  initializeToken() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.token = token;
    }
  }
}

export const apiService = new ApiService();

// Initialize token on service creation
apiService.initializeToken();