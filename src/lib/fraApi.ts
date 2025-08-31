// FRA Workflow System API Functions
// These functions interact with the new database schema for claim management

import { supabase } from './supabase/client';
import { 
  FRAClaim, 
  FRAClaimWithDetails, 
  User, 
  Jurisdiction, 
  ClaimSubmissionForm,
  ClaimReview,
  DashboardStats,
  MapClaim,
  MockAadhaarVerification,
  APIResponse,
  PaginatedResponse
} from './fraTypes';

// Mock Aadhaar verification for demo purposes
const MOCK_AADHAAR_VERIFICATIONS: MockAadhaarVerification[] = [
  { aadhaar_number: '123456789012', otp: '123456', is_valid: true },
  { aadhaar_number: '234567890123', otp: '234567', is_valid: true },
  { aadhaar_number: '345678901234', otp: '345678', is_valid: true },
  { aadhaar_number: '456789012345', otp: '456789', is_valid: true },
  { aadhaar_number: '567890123456', otp: '567890', is_valid: true },
];

// Aadhaar verification functions
export const verifyAadhaar = async (aadhaarNumber: string, otp: string): Promise<APIResponse<User>> => {
  try {
    // Mock verification for demo
    const verification = MOCK_AADHAAR_VERIFICATIONS.find(
      v => v.aadhaar_number === aadhaarNumber && v.otp === otp
    );

    if (!verification || !verification.is_valid) {
      return {
        success: false,
        error: 'Invalid Aadhaar number or OTP'
      };
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('aadhaar_number', aadhaarNumber)
      .eq('role_type', 'civilian')
      .single();

    if (error || !user) {
      return {
        success: false,
        error: 'User not found or not a civilian'
      };
    }

    return {
      success: true,
      data: user
    };
  } catch (error) {
    return {
      success: false,
      error: 'Verification failed'
    };
  }
};

// Generate mock OTP for demo
export const generateMockOTP = (aadhaarNumber: string): string => {
  const verification = MOCK_AADHAAR_VERIFICATIONS.find(v => v.aadhaar_number === aadhaarNumber);
  return verification ? verification.otp : '000000';
};

// FRA Claims functions
export const submitClaim = async (claimData: ClaimSubmissionForm, civilianId: string): Promise<APIResponse<FRAClaim>> => {
  try {
    // Generate claim number
    const claimNumber = `FRA-${claimData.claim_type}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Get jurisdiction based on village/district
    const { data: jurisdiction } = await supabase
      .from('jurisdictions')
      .select('id')
      .eq('name', claimData.village)
      .single();

    if (!jurisdiction) {
      return {
        success: false,
        error: 'Jurisdiction not found'
      };
    }

    // Create claim record
    const { data: claim, error } = await supabase
      .from('fra_claims')
      .insert({
        claim_number: claimNumber,
        civilian_id: civilianId,
        jurisdiction_id: jurisdiction.id,
        claim_type: claimData.claim_type,
        claim_status: 'Submitted',
        applicant_name: claimData.applicant_name,
        father_name: claimData.father_name,
        tribe: claimData.tribe,
        village: claimData.village,
        block: claimData.block,
        district: claimData.district,
        state: claimData.state,
        land_area: claimData.land_area,
        survey_number: claimData.survey_number,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: 'Failed to submit claim'
      };
    }

    return {
      success: true,
      data: claim
    };
  } catch (error) {
    return {
      success: false,
      error: 'Claim submission failed'
    };
  }
};

export const getClaimsByUser = async (userId: string, userRole: string): Promise<APIResponse<FRAClaimWithDetails[]>> => {
  try {
    let query = supabase
      .from('fra_claims')
      .select(`
        *,
        civilian:users!fra_claims_civilian_id_fkey(*),
        officer:users!fra_claims_officer_id_fkey(*),
        jurisdiction:jurisdictions(*)
      `);

    if (userRole === 'civilian') {
      query = query.eq('civilian_id', userId);
    } else if (userRole === 'officer') {
      // Get officer's jurisdiction and filter claims
      const { data: officer } = await supabase
        .from('users')
        .select('jurisdiction_id')
        .eq('id', userId)
        .single();

      if (officer?.jurisdiction_id) {
        query = query.eq('jurisdiction_id', officer.jurisdiction_id);
      }
    }
    // Admin can see all claims

    const { data: claims, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch claims'
      };
    }

    return {
      success: true,
      data: claims || []
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch claims'
    };
  }
};

export const getClaimById = async (claimId: string): Promise<APIResponse<FRAClaimWithDetails>> => {
  try {
    const { data: claim, error } = await supabase
      .from('fra_claims')
      .select(`
        *,
        civilian:users!fra_claims_civilian_id_fkey(*),
        officer:users!fra_claims_officer_id_fkey(*),
        jurisdiction:jurisdictions(*)
      `)
      .eq('id', claimId)
      .single();

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch claim'
      };
    }

    return {
      success: true,
      data: claim
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch claim'
    };
  }
};

export const reviewClaim = async (review: ClaimReview, officerId: string): Promise<APIResponse<FRAClaim>> => {
  try {
    const updateData: any = {
      claim_status: review.action === 'approve' ? 'Approved' : 'Rejected',
      reviewed_at: new Date().toISOString(),
      officer_id: officerId
    };

    if (review.action === 'reject' && review.rejection_reason) {
      updateData.rejection_reason = review.rejection_reason;
    }

    if (review.notes) {
      updateData.officer_notes = review.notes;
    }

    const { data: claim, error } = await supabase
      .from('fra_claims')
      .update(updateData)
      .eq('id', review.claim_id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: 'Failed to update claim'
      };
    }

    // Add status history
    await supabase
      .from('claim_status_history')
      .insert({
        claim_id: review.claim_id,
        status: updateData.claim_status,
        changed_by: officerId,
        notes: review.notes
      });

    return {
      success: true,
      data: claim
    };
  } catch (error) {
    return {
      success: false,
      error: 'Claim review failed'
    };
  }
};

// Dashboard functions
export const getDashboardStats = async (userId: string, userRole: string): Promise<APIResponse<DashboardStats>> => {
  try {
    let claimsQuery = supabase.from('fra_claims').select('claim_type, claim_status');

    if (userRole === 'civilian') {
      claimsQuery = claimsQuery.eq('civilian_id', userId);
    } else if (userRole === 'officer') {
      const { data: officer } = await supabase
        .from('users')
        .select('jurisdiction_id')
        .eq('id', userId)
        .single();

      if (officer?.jurisdiction_id) {
        claimsQuery = claimsQuery.eq('jurisdiction_id', officer.jurisdiction_id);
      }
    }

    const { data: claims, error } = await claimsQuery;

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch dashboard stats'
      };
    }

    const total_claims = claims?.length || 0;
    const pending_claims = claims?.filter(c => c.claim_status === 'Submitted' || c.claim_status === 'Under Review').length || 0;
    const approved_claims = claims?.filter(c => c.claim_status === 'Approved' || c.claim_status === 'Granted').length || 0;
    const rejected_claims = claims?.filter(c => c.claim_status === 'Rejected').length || 0;

    const claims_by_type = claims?.reduce((acc, claim) => {
      acc[claim.claim_type] = (acc[claim.claim_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const claims_by_status = claims?.reduce((acc, claim) => {
      acc[claim.claim_status] = (acc[claim.claim_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      success: true,
      data: {
        total_claims,
        pending_claims,
        approved_claims,
        rejected_claims,
        claims_by_type,
        claims_by_status
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch dashboard stats'
    };
  }
};

// Map functions
export const getClaimsForMap = async (userId: string, userRole: string): Promise<APIResponse<MapClaim[]>> => {
  try {
    let query = supabase
      .from('fra_claims')
      .select(`
        id,
        claim_number,
        claim_type,
        claim_status,
        applicant_name,
        village,
        district,
        state,
        land_area,
        land_coordinates,
        land_boundary
      `);

    if (userRole === 'civilian') {
      query = query.eq('civilian_id', userId);
    } else if (userRole === 'officer') {
      const { data: officer } = await supabase
        .from('users')
        .select('jurisdiction_id')
        .eq('id', userId)
        .single();

      if (officer?.jurisdiction_id) {
        query = query.eq('jurisdiction_id', officer.jurisdiction_id);
      }
    }

    const { data: claims, error } = await query;

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch map claims'
      };
    }

    const mapClaims: MapClaim[] = (claims || []).map(claim => ({
      id: claim.id,
      claim_number: claim.claim_number,
      claim_type: claim.claim_type,
      claim_status: claim.claim_status,
      applicant_name: claim.applicant_name,
      village: claim.village,
      district: claim.district,
      state: claim.state,
      land_area: claim.land_area,
      coordinates: claim.land_coordinates ? [claim.land_coordinates.x, claim.land_coordinates.y] : [0, 0],
      boundary: claim.land_boundary ? claim.land_boundary.coordinates[0] : undefined
    }));

    return {
      success: true,
      data: mapClaims
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch map claims'
    };
  }
};

// Jurisdiction functions
export const getJurisdictions = async (): Promise<APIResponse<Jurisdiction[]>> => {
  try {
    const { data: jurisdictions, error } = await supabase
      .from('jurisdictions')
      .select('*')
      .order('name');

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch jurisdictions'
      };
    }

    return {
      success: true,
      data: jurisdictions || []
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch jurisdictions'
    };
  }
};

// Notification functions
export const getNotifications = async (userId: string): Promise<APIResponse<any[]>> => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch notifications'
      };
    }

    return {
      success: true,
      data: notifications || []
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch notifications'
    };
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<APIResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      return {
        success: false,
        error: 'Failed to mark notification as read'
      };
    }

    return {
      success: true,
      data: true
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to mark notification as read'
    };
  }
};
