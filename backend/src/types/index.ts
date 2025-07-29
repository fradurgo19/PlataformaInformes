export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user' | 'viewer';
  zone?: string;
  brands?: string[];
  specialty?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  client_name: string;
  machine_type: MachineType;
  model: string;
  serial_number: string;
  hourmeter: number;
  report_date: string;
  ott: string;
  conclusions?: string;
  overall_suggestions?: string;
  status: 'draft' | 'completed' | 'archived';
  general_status: 'PENDING' | 'CLOSED';
  created_at: string;
  updated_at: string;
  components?: Component[];
  suggested_parts?: SuggestedPart[];
  user_full_name?: string;
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
  type: ComponentType;
  findings: string;
  parameters?: Parameter[];
  status: 'CORRECTED' | 'PENDING';
  suggestions?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
  updated_at: string;
  photos?: Photo[];
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

export interface SuggestedPart {
  id: string;
  report_id: string;
  part_number: string;
  description: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export type MachineType = 
  | 'OTHER'
  | 'EXCAVATOR'
  | 'SKID_STEER'
  | 'BACKHOE_LOADER'
  | 'MOTOR_GRADER'
  | 'MINI_EXCAVATOR'
  | 'WHEEL_LOADER';

export type ComponentType = 
  | 'CUTTING_TOOL'
  | 'UNDERCARRIAGE'
  | 'CYLINDER_SEALS'
  | 'ENGINE'
  | 'RADIATOR'
  | 'ENGINE_PERIPHERALS'
  | 'BUCKET_FRONT_EQUIPMENT_FITTINGS'
  | 'ARM_BOOM_FRONT_EQUIPMENT_FITTINGS'
  | 'BOOM_CHASSIS_FRONT_EQUIPMENT_FITTINGS'
  | 'SLEW_RING_PINION'
  | 'COUPLING'
  | 'HYDRAULIC_PUMP'
  | 'SWING_MOTOR'
  | 'TRAVEL_MOTOR'
  | 'SEALS'
  | 'MISCELLANEOUS';

export interface CreateReportRequest {
  client_name: string;
  machine_type: MachineType;
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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  zone?: string;
  brands?: string[];
  specialty?: string;
  rating?: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'user' | 'viewer';
  zone?: string;
  brands?: string[];
  specialty?: string;
  rating?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 