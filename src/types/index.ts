export interface MachineType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ComponentType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type ComponentStatus = 'CORRECTED' | 'PENDING';

export type UserRole = 'admin' | 'user';

export type ReportStatus = 'draft' | 'completed' | 'archived';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  component_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface Parameter {
  name: string;
  minValue: number;
  maxValue: number;
  measuredValue: number;
  corrected: boolean;
  observation: string;
}

export interface Component {
  id: string;
  report_id: string;
  type: string; // ComponentType name
  findings: string;
  parameters?: Parameter[];
  status: ComponentStatus;
  suggestions?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
  updated_at: string;
  photos?: Photo[];
}

export interface SuggestedPart {
  id: string;
  report_id: string;
  part_number: string;
  description: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  client_name: string;
  machine_type: string; // MachineType name
  model: string;
  serial_number: string;
  hourmeter: number;
  report_date: string;
  ott: string;
  conclusions?: string;
  overall_suggestions?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  components?: Component[];
  suggested_parts?: SuggestedPart[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportFilters {
  status?: ReportStatus;
  machineType?: string; // MachineType name
  clientName?: string;
  page?: number;
  limit?: number;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateReportRequest {
  client_name: string;
  machine_type: string; // MachineType name
  model: string;
  serial_number: string;
  hourmeter: number;
  report_date: string;
  ott: string;
  conclusions?: string;
  overall_suggestions?: string;
  components: Omit<Component, 'id' | 'report_id' | 'created_at' | 'updated_at'>[];
  suggested_parts: Omit<SuggestedPart, 'id' | 'report_id' | 'created_at' | 'updated_at'>[];
}