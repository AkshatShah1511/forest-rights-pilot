// FRA Workflow System TypeScript Types
// These types correspond to the database schema in migration 002_fra_workflow_schema.sql

export interface User {
  id: string;
  role: string;
  role_type: 'civilian' | 'officer' | 'admin';
  email: string;
  name: string;
  aadhaar_number?: string;
  jurisdiction_id?: string;
  phone_number?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Jurisdiction {
  id: string;
  name: string;
  type: 'state' | 'district' | 'block' | 'village';
  parent_id?: string;
  coordinates?: any; // PostGIS geometry
  created_at: string;
  updated_at: string;
}

export interface FRAClaim {
  id: string;
  claim_number: string;
  civilian_id: string;
  officer_id?: string;
  jurisdiction_id: string;
  
  // Claim details
  claim_type: 'IFR' | 'CR' | 'CFR';
  claim_status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Granted';
  
  // Applicant details
  applicant_name: string;
  father_name?: string;
  aadhaar_number?: string;
  tribe?: string;
  village: string;
  block?: string;
  district: string;
  state: string;
  
  // Land details
  land_area: number;
  land_coordinates?: any; // PostGIS point
  land_boundary?: any; // PostGIS polygon
  survey_number?: string;
  
  // Supporting documents
  pdf_file_path?: string;
  extracted_text?: string;
  extracted_metadata?: Record<string, any>;
  
  // Processing details
  submitted_at: string;
  reviewed_at?: string;
  approved_at?: string;
  rejection_reason?: string;
  
  // Officer notes
  officer_notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ClaimStatusHistory {
  id: string;
  claim_id: string;
  status: string;
  changed_by: string;
  changed_at: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_claim_id?: string;
  created_at: string;
}

export interface AadhaarVerification {
  id: string;
  aadhaar_number: string;
  civilian_id: string;
  is_verified: boolean;
  verification_otp?: string;
  otp_expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Extended interfaces for frontend use
export interface FRAClaimWithDetails extends FRAClaim {
  civilian?: User;
  officer?: User;
  jurisdiction?: Jurisdiction;
  status_history?: ClaimStatusHistory[];
}

export interface UserWithJurisdiction extends User {
  jurisdiction?: Jurisdiction;
}

// Form interfaces for claim submission
export interface ClaimSubmissionForm {
  claim_type: 'IFR' | 'CR' | 'CFR';
  applicant_name: string;
  father_name?: string;
  tribe?: string;
  village: string;
  block?: string;
  district: string;
  state: string;
  land_area: number;
  survey_number?: string;
  pdf_file: File;
}

// Officer review interfaces
export interface ClaimReview {
  claim_id: string;
  action: 'approve' | 'reject';
  notes?: string;
  rejection_reason?: string;
}

// Dashboard data interfaces
export interface DashboardStats {
  total_claims: number;
  pending_claims: number;
  approved_claims: number;
  rejected_claims: number;
  claims_by_type: Record<string, number>;
  claims_by_status: Record<string, number>;
}

// Map interfaces for geospatial data
export interface MapClaim {
  id: string;
  claim_number: string;
  claim_type: 'IFR' | 'CR' | 'CFR';
  claim_status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Granted';
  applicant_name: string;
  village: string;
  district: string;
  state: string;
  land_area: number;
  coordinates: [number, number]; // [longitude, latitude]
  boundary?: [number, number][]; // polygon coordinates
}

// API response interfaces
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Mock Aadhaar interface for demo
export interface MockAadhaarVerification {
  aadhaar_number: string;
  otp: string;
  is_valid: boolean;
}

// Constants
export const CLAIM_STATUSES = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  GRANTED: 'Granted'
} as const;

export const CLAIM_TYPES = {
  IFR: 'IFR',
  CR: 'CR',
  CFR: 'CFR'
} as const;

export const USER_ROLES = {
  CIVILIAN: 'civilian',
  OFFICER: 'officer',
  ADMIN: 'admin'
} as const;
