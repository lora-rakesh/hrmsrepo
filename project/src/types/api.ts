/**
 * API Types and Interfaces
 * Auto-generated from Django REST Framework serializers
 */

// Base Types
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export type UserRole = 'SUPER_ADMIN' | 'HR_MANAGER' | 'PAYROLL_ADMIN' | 'TEAM_LEAD' | 'RECRUITER' | 'EMPLOYEE';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// Employee Types
export interface Employee extends BaseModel {
  user: User;
  employee_id: string;
  full_name: string;
  age?: number;
  date_of_birth?: string;
  gender: 'M' | 'F' | 'O' | '';
  marital_status: string;
  nationality: string;
  personal_email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  current_address: string;
  permanent_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  department?: Department;
  department_name?: string;
  job_title?: JobTitle;
  job_title_name?: string;
  manager?: Employee;
  manager_name?: string;
  employment_status: EmploymentStatus;
  employment_type: EmploymentType;
  date_of_joining: string;
  date_of_leaving?: string;
  probation_end_date?: string;
  basic_salary: string;
  profile_picture?: string;
  resume?: string;
}

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

// Department Types
export interface Department extends BaseModel {
  name: string;
  code: string;
  description: string;
  head?: Employee;
  head_name?: string;
  parent?: Department;
  organization: string;
  is_active: boolean;
}

// Job Title Types
export interface JobTitle extends BaseModel {
  title: string;
  description: string;
  department: string;
  department_name?: string;
  level: number;
  is_active: boolean;
}

// Leave Types
export interface LeaveType extends BaseModel {
  name: string;
  code: string;
  days_allowed_per_year: number;
  carry_forward_allowed: boolean;
  max_carry_forward_days: number;
  minimum_days_notice: number;
  maximum_consecutive_days: number;
  description: string;
  is_active: boolean;
}

export interface LeaveBalance extends BaseModel {
  employee: string;
  employee_name?: string;
  leave_type: string;
  leave_type_name?: string;
  year: number;
  total_days: string;
  used_days: string;
  carry_forward_days: string;
  available_days: string;
}

export interface LeaveRequest extends BaseModel {
  employee: string;
  employee_name?: string;
  leave_type: string;
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  days_requested: string;
  reason: string;
  status: LeaveStatus;
  applied_date: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_date?: string;
  rejection_reason: string;
  handover_to?: string;
  handover_to_name?: string;
  handover_notes: string;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequestCreate {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  handover_to?: string;
  handover_notes?: string;
}

// Attendance Types
export interface Shift extends BaseModel {
  name: string;
  start_time: string;
  end_time: string;
  break_duration: string;
  total_hours: string;
  is_active: boolean;
}

export interface Attendance extends BaseModel {
  employee: string;
  employee_name?: string;
  date: string;
  shift?: string;
  shift_name?: string;
  check_in_time?: string;
  check_out_time?: string;
  break_time?: string;
  total_hours: string;
  overtime_hours: string;
  status: AttendanceStatus;
  is_manual_entry: boolean;
  manual_entry_reason: string;
  approved_by?: string;
  approved_by_name?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE';

export type WorkMode = 'REGULAR' | 'HYBRID' | 'REMOTE';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface AttendanceRequest extends BaseModel {
  employee: string;
  employee_name?: string;
  date: string;
  requested_check_in?: string;
  requested_check_out?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: string;
  approved_by_name?: string;
  approved_date?: string;
  rejection_reason: string;
}

// Task Management Types
export interface Task extends BaseModel {
  title: string;
  description: string;
  assigned_to: string;
  assigned_to_name?: string;
  assigned_by: string;
  assigned_by_name?: string;
  team?: string;
  team_name?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  due_date?: string;
  completed_at?: string;
  tags: string[];
  progress: number;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies?: string[];
}

export interface Team extends BaseModel {
  name: string;
  description: string;
  lead: string;
  lead_name?: string;
  members: string[];
  member_names?: string[];
  is_active: boolean;
  color?: string;
  avatar?: string;
  created_by?: string;
}

export interface Project extends BaseModel {
  name: string;
  description: string;
  team: string;
  team_name?: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  start_date: string;
  end_date?: string;
  progress: number;
  budget?: string;
  client?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
}

// Holiday Types
export interface Holiday extends BaseModel {
  name: string;
  date: string;
  description: string;
  is_optional: boolean;
  type: 'NATIONAL' | 'RELIGIOUS' | 'COMPANY' | 'OPTIONAL';
}

// Detailed Attendance Types
export interface AttendanceSession extends BaseModel {
  attendance: string;
  session_type: 'CHECK_IN' | 'BREAK_START' | 'BREAK_END' | 'LUNCH_START' | 'LUNCH_END' | 'CHECK_OUT';
  timestamp: string;
  location?: LocationData;
  work_mode: WorkMode;
  notes?: string;
}

// Report Types
export interface ReportTemplate extends BaseModel {
  name: string;
  report_type: 'EMPLOYEE' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'CUSTOM';
  description: string;
  parameters: Record<string, any>;
  is_active: boolean;
  created_by: string;
}

export interface GeneratedReport extends BaseModel {
  template: string;
  name: string;
  parameters: Record<string, any>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  file_path?: string;
  generated_by: string;
  generated_at?: string;
  error_message?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: any;
}

// Form Types
export interface EmployeeCreateForm {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role: UserRole;
  employee_id: string;
  date_of_birth?: string;
  gender?: string;
  personal_email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  current_address?: string;
  department?: string;
  job_title?: string;
  manager?: string;
  employment_type?: EmploymentType;
  work_mode: string;

  date_of_joining: string;
  basic_salary?: string;
}