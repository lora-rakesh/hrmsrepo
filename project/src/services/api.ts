/**
 * API Service Layer
 * Centralized HTTP client with authentication and error handling
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User, LoginRequest, LoginResponse, Employee, EmployeeCreateForm,
  LeaveType, LeaveRequest, LeaveRequestCreate, LeaveBalance,
  Attendance, AttendanceRequest, Shift, Department, JobTitle,
  PaginatedResponse
} from '../types/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('/auth/token/refresh/', {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout/', { refresh: refreshToken });
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/me/update/', data);
    return response.data;
  },
  // Add to your authApi object
uploadAvatar: async (formData: FormData): Promise<User> => {
  const response = await api.put('/auth/me/update/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
},

removeAvatar: async (): Promise<User> => {
  const response = await api.delete('/auth/me/avatar/');
  return response.data;
},

  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> => {
    await api.post('/auth/me/change-password/', data);
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};

// Employee API
export const employeeApi = {
  getAll: async (params?: any): Promise<PaginatedResponse<Employee>> => {
    const response = await api.get('/employees/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}/`);
    return response.data;
  },

  create: async (data: EmployeeCreateForm): Promise<Employee> => {
    const response = await api.post('/employees/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.put(`/employees/${id}/`, data);
    return response.data;
  },

  updateProfile: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.put(`/employees/${id}/update_profile/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}/`);
  },

  terminate: async (id: string, data: { termination_date: string; reason: string }): Promise<void> => {
    await api.post(`/employees/${id}/terminate/`, data);
  },
};

// Department API
export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get("/core/departments/");
    return response.data.results || response.data;
  },

  create: async (data: Partial<Department>): Promise<Department> => {
    const response = await api.post("/core/departments/", data);
    return response.data;
  },
};


// Job Title API
export const jobTitleApi = {
  getAll: async (departmentId?: string): Promise<JobTitle[]> => {
    const params = departmentId ? { department: departmentId } : {};
    const response = await api.get('/core/job-titles/', { params });
    return response.data.results || response.data;
  },

  create: async (data: Partial<JobTitle>): Promise<JobTitle> => {
    const response = await api.post('/core/job-titles/', data);
    return response.data;
  },
};

// Leave API
export const leaveApi = {
  getTypes: async (): Promise<LeaveType[]> => {
    const response = await api.get('/leaves/types/');
    return response.data.results || response.data;
  },

  getBalances: async (): Promise<LeaveBalance[]> => {
    const response = await api.get('/leaves/balances/');
    return response.data.results || response.data;
  },

  getRequests: async (params?: any): Promise<PaginatedResponse<LeaveRequest>> => {
    const response = await api.get('/leaves/requests/', { params });
    return response.data;
  },

  createRequest: async (data: LeaveRequestCreate): Promise<LeaveRequest> => {
    const response = await api.post('/leaves/requests/', data);
    return response.data;
  },

  approveRequest: async (id: string): Promise<void> => {
    await api.post(`/leaves/requests/${id}/approve/`);
  },

  rejectRequest: async (id: string, reason: string): Promise<void> => {
    await api.post(`/leaves/requests/${id}/reject/`, { reason });
  },

  getPendingRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/leaves/requests/pending/');
    return response.data;
  },
};

// Attendance API
export const attendanceApi = {
  getShifts: async (): Promise<Shift[]> => {
    const response = await api.get('/attendance/shifts/');
    return response.data.results || response.data;
  },

  getRecords: async (params?: any): Promise<PaginatedResponse<Attendance>> => {
    const response = await api.get('/attendance/records/', { params });
    return response.data;
  },

  getTodayAttendance: async (): Promise<Attendance | null> => {
    const response = await api.get('/attendance/records/today/');
    return response.data;
  },

  checkIn: async (data?: { check_in_time?: string }): Promise<void> => {
    await api.post('/attendance/records/check_in/', data || {});
  },

  checkOut: async (data?: { check_out_time?: string }): Promise<void> => {
    await api.post('/attendance/records/check_out/', data || {});
  },

  createRequest: async (data: Partial<AttendanceRequest>): Promise<AttendanceRequest> => {
    const response = await api.post('/attendance/requests/', data);
    return response.data;
  },

  approveRequest: async (id: string): Promise<void> => {
    await api.post(`/attendance/requests/${id}/approve/`);
  },
};

// Task Management API
export const taskApi = {
  getAll: async (params?: any): Promise<PaginatedResponse<any>> => {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  create: async (data: any): Promise<any> => {
    const response = await api.post('/tasks/', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/tasks/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}/`);
  },
};

// Team Management API
export const teamApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/teams/');
    return response.data.results || response.data;
  },

  create: async (data: any): Promise<any> => {
    const response = await api.post('/teams/', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/teams/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/teams/${id}/`);
  },
};

export default api;