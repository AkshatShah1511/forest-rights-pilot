-- FRA Workflow System Schema Extension
-- This migration adds new tables for the complete FRA claim management workflow

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Extend existing users table with new role types and Aadhaar
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role_type VARCHAR(20) DEFAULT 'officer' CHECK (role_type IN ('civilian', 'officer', 'admin')),
ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS jurisdiction_id UUID,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Create jurisdictions table for officer assignments
CREATE TABLE IF NOT EXISTS public.jurisdictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('state', 'district', 'block', 'village')),
    parent_id UUID REFERENCES public.jurisdictions(id),
    coordinates GEOMETRY(POLYGON, 4326), -- PostGIS geometry for boundary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FRA claims table (extends existing claims table)
CREATE TABLE IF NOT EXISTS public.fra_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_number TEXT UNIQUE NOT NULL,
    civilian_id UUID NOT NULL REFERENCES public.users(id),
    officer_id UUID REFERENCES public.users(id),
    jurisdiction_id UUID NOT NULL REFERENCES public.jurisdictions(id),
    
    -- Claim details
    claim_type VARCHAR(10) NOT NULL CHECK (claim_type IN ('IFR', 'CR', 'CFR')),
    claim_status VARCHAR(20) NOT NULL DEFAULT 'Submitted' CHECK (claim_status IN ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Granted')),
    
    -- Applicant details
    applicant_name TEXT NOT NULL,
    father_name TEXT,
    aadhaar_number VARCHAR(20),
    tribe TEXT,
    village TEXT NOT NULL,
    block TEXT,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    
    -- Land details
    land_area DECIMAL(10,2) NOT NULL,
    land_coordinates GEOMETRY(POINT, 4326), -- PostGIS point for land location
    land_boundary GEOMETRY(POLYGON, 4326), -- PostGIS polygon for land boundary
    survey_number TEXT,
    
    -- Supporting documents
    pdf_file_path TEXT,
    extracted_text TEXT,
    extracted_metadata JSONB DEFAULT '{}',
    
    -- Processing details
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Officer notes
    officer_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claim status history table
CREATE TABLE IF NOT EXISTS public.claim_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id UUID NOT NULL REFERENCES public.fra_claims(id),
    status VARCHAR(20) NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    related_claim_id UUID REFERENCES public.fra_claims(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mock Aadhaar verification table
CREATE TABLE IF NOT EXISTS public.aadhaar_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aadhaar_number VARCHAR(20) UNIQUE NOT NULL,
    civilian_id UUID NOT NULL REFERENCES public.users(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_otp VARCHAR(6),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fra_claims_civilian_id ON public.fra_claims(civilian_id);
CREATE INDEX IF NOT EXISTS idx_fra_claims_officer_id ON public.fra_claims(officer_id);
CREATE INDEX IF NOT EXISTS idx_fra_claims_jurisdiction_id ON public.fra_claims(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_fra_claims_status ON public.fra_claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_fra_claims_coordinates ON public.fra_claims USING GIST(land_coordinates);
CREATE INDEX IF NOT EXISTS idx_fra_claims_boundary ON public.fra_claims USING GIST(land_boundary);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_coordinates ON public.jurisdictions USING GIST(coordinates);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_fra_claims_updated_at BEFORE UPDATE ON fra_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claim_status_history_updated_at BEFORE UPDATE ON claim_status_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aadhaar_verifications_updated_at BEFORE UPDATE ON aadhaar_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample jurisdictions
INSERT INTO public.jurisdictions (name, type, coordinates) VALUES
('Maharashtra', 'state', ST_GeomFromText('POLYGON((72.8 19.0, 80.9 19.0, 80.9 21.7, 72.8 21.7, 72.8 19.0))', 4326)),
('Gadchiroli', 'district', ST_GeomFromText('POLYGON((79.5 19.5, 80.5 19.5, 80.5 20.5, 79.5 20.5, 79.5 19.5))', 4326)),
('Bhamragad', 'village', ST_GeomFromText('POLYGON((79.8 19.8, 79.9 19.8, 79.9 19.9, 79.8 19.9, 79.8 19.8))', 4326)),
('Etapalli', 'village', ST_GeomFromText('POLYGON((79.9 19.7, 80.0 19.7, 80.0 19.8, 79.9 19.8, 79.9 19.7))', 4326));

-- Insert sample civilian users
INSERT INTO public.users (role, role_type, email, name, aadhaar_number, phone_number, address, jurisdiction_id) VALUES
('civilian', 'civilian', 'sukhlal.gond@example.com', 'Sukhlal Gond', '123456789012', '9876543210', 'Village: Bhamragad, Block: Gadchiroli, District: Gadchiroli, State: Maharashtra', (SELECT id FROM jurisdictions WHERE name = 'Bhamragad')),
('civilian', 'civilian', 'ramesh.korku@example.com', 'Ramesh Korku', '234567890123', '9876543211', 'Village: Etapalli, Block: Gadchiroli, District: Gadchiroli, State: Maharashtra', (SELECT id FROM jurisdictions WHERE name = 'Etapalli')),
('civilian', 'civilian', 'lakshmi.muria@example.com', 'Lakshmi Muria', '345678901234', '9876543212', 'Village: Bijapur, Block: Bijapur, District: Bijapur, State: Chhattisgarh', (SELECT id FROM jurisdictions WHERE name = 'Bijapur'));

-- Insert sample officer with jurisdiction
INSERT INTO public.users (role, role_type, email, name, jurisdiction_id) VALUES
('officer', 'officer', 'officer.gadchiroli@fra.gov.in', 'Field Officer Gadchiroli', (SELECT id FROM jurisdictions WHERE name = 'Gadchiroli'));

-- Insert sample Aadhaar verifications
INSERT INTO public.aadhaar_verifications (aadhaar_number, civilian_id, is_verified) VALUES
('123456789012', (SELECT id FROM users WHERE aadhaar_number = '123456789012'), true),
('234567890123', (SELECT id FROM users WHERE aadhaar_number = '234567890123'), true),
('345678901234', (SELECT id FROM users WHERE aadhaar_number = '345678901234'), true);

-- Insert sample FRA claims
INSERT INTO public.fra_claims (
    claim_number, civilian_id, officer_id, jurisdiction_id, claim_type, claim_status,
    applicant_name, father_name, tribe, village, district, state, land_area, land_coordinates
) VALUES
(
    'FRA-IFR-2024-001',
    (SELECT id FROM users WHERE aadhaar_number = '123456789012'),
    (SELECT id FROM users WHERE email = 'officer.gadchiroli@fra.gov.in'),
    (SELECT id FROM jurisdictions WHERE name = 'Bhamragad'),
    'IFR', 'Under Review',
    'Sukhlal Gond', 'Ramesh Gond', 'Gond', 'Bhamragad', 'Gadchiroli', 'Maharashtra',
    1.8, ST_GeomFromText('POINT(79.85 19.85)', 4326)
),
(
    'FRA-CFR-2024-002',
    (SELECT id FROM users WHERE aadhaar_number = '234567890123'),
    (SELECT id FROM users WHERE email = 'officer.gadchiroli@fra.gov.in'),
    (SELECT id FROM jurisdictions WHERE name = 'Etapalli'),
    'CFR', 'Submitted',
    'Community Claim', 'N/A', 'Korku', 'Etapalli', 'Gadchiroli', 'Maharashtra',
    15.2, ST_GeomFromText('POINT(79.95 19.75)', 4326)
);

-- Enable Row Level Security on new tables
ALTER TABLE public.fra_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aadhaar_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Civilian can only see their own claims
CREATE POLICY "Civilian can view own claims" ON public.fra_claims
    FOR SELECT USING (civilian_id = auth.uid() OR role_type = 'civilian');

-- Officer can see claims in their jurisdiction
CREATE POLICY "Officer can view jurisdiction claims" ON public.fra_claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role_type = 'officer' 
            AND u.jurisdiction_id = fra_claims.jurisdiction_id
        )
    );

-- Admin can see all claims
CREATE POLICY "Admin can view all claims" ON public.fra_claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role_type = 'admin'
        )
    );

-- Similar policies for other tables...
