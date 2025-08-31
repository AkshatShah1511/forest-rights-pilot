-- Create claims table
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('IFR', 'CFR', 'CR')),
    state TEXT NOT NULL,
    village TEXT NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    date DATE NOT NULL,
    applicant_name TEXT NOT NULL,
    tribe TEXT NOT NULL,
    poverty_index DECIMAL(5,4) NOT NULL,
    groundwater_index DECIMAL(5,4) NOT NULL,
    agri_area DECIMAL(10,2) NOT NULL,
    forest_degradation DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schemes table
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    eligibility JSONB NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    evidence_keys TEXT[] NOT NULL DEFAULT '{}',
    weights JSONB NOT NULL,
    budget DECIMAL(15,2) NOT NULL,
    households_affected INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processed', 'Failed')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'officer' CHECK (role IN ('admin', 'officer')),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON schemes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.claims (type, state, village, area, status, date, applicant_name, tribe, poverty_index, groundwater_index, agri_area, forest_degradation) VALUES
('IFR', 'Maharashtra', 'Bhamragad', 1.8, 'Approved', '2024-01-15', 'Sukhlal Gond', 'Gond', 0.75, 0.35, 2.5, 45.2),
('CFR', 'Maharashtra', 'Bhamragad', 15.2, 'Approved', '2024-01-20', 'Community Claim', 'Gond', 0.82, 0.28, 8.7, 52.1),
('IFR', 'Maharashtra', 'Etapalli', 2.1, 'Pending', '2024-02-10', 'Ramesh Korku', 'Korku', 0.68, 0.42, 3.2, 38.5),
('CR', 'Maharashtra', 'Etapalli', 5.5, 'Approved', '2024-02-15', 'Community Claim', 'Korku', 0.71, 0.38, 4.8, 41.3),
('IFR', 'Chhattisgarh', 'Bijapur', 1.5, 'Rejected', '2024-03-05', 'Lakshmi Muria', 'Muria', 0.65, 0.45, 1.8, 35.7);

INSERT INTO public.schemes (name, eligibility, priority, evidence_keys, weights, budget, households_affected) VALUES
('Water Conservation Scheme', '{"povertyIndex": {"min": 0.6}, "groundwaterIndex": {"max": 0.4}}', 1, '{"povertyIndex", "groundwaterIndex"}', '{"povertyIndex": 0.6, "groundwaterIndex": 0.4}', 500000.00, 150),
('Agricultural Support Program', '{"agriArea": {"min": 2.0}, "povertyIndex": {"min": 0.5}}', 2, '{"agriArea", "povertyIndex"}', '{"agriArea": 0.7, "povertyIndex": 0.3}', 750000.00, 200),
('Forest Restoration Initiative', '{"forestDegradation": {"max": 50.0}, "groundwaterIndex": {"max": 0.5}}', 3, '{"forestDegradation", "groundwaterIndex"}', '{"forestDegradation": 0.5, "groundwaterIndex": 0.5}', 300000.00, 100),
('Tribal Development Fund', '{"povertyIndex": {"min": 0.7}}', 1, '{"povertyIndex"}', '{"povertyIndex": 1.0}', 1000000.00, 300);

INSERT INTO public.documents (filename, status, extracted_text, metadata) VALUES
('IFR_Claim_Sukhlal_Gond.pdf', 'Processed', 'FOREST RIGHTS ACT 2006 INDIVIDUAL FOREST RIGHTS CLAIM APPLICATION Claim Application No: IFR-MH-0001 Date of Application: 15th January 2024 APPLICANT DETAILS: Name: Sukhlal Gond Father''s Name: Ramesh Gond Gender: Male Age: 45 years Tribe: Gond Village: Bhamragad Block: Gadchiroli District: Gadchiroli State: Maharashtra', '{"size": 245760, "type": "application/pdf", "pages": 3}'),
('CFR_Survey_Bhamragad.pdf', 'Processed', 'COMMUNITY FOREST RIGHTS SURVEY REPORT Village: Bhamragad Total Area: 15.2 hectares Number of Households: 45 Primary Tribe: Gond Forest Type: Mixed Deciduous', '{"size": 512000, "type": "application/pdf", "pages": 5}'),
('Legacy_Records_Block_7.pdf', 'Pending', 'Legacy forest records from Block 7 containing historical land use patterns and traditional forest rights documentation.', '{"size": 1024000, "type": "application/pdf", "pages": 12}');

INSERT INTO public.users (role, email, name) VALUES
('admin', 'admin@fra-atlas.gov.in', 'System Administrator'),
('officer', 'officer@fra-atlas.gov.in', 'Field Officer'),
('officer', 'assistant@fra-atlas.gov.in', 'Assistant Officer');

-- Insert demo profiles for authentication
INSERT INTO public.profiles (user_id, email, full_name, role) VALUES
('demo-admin-id', 'admin@fra-atlas.gov.in', 'System Administrator', 'admin'),
('demo-officer-id', 'officer@fra-atlas.gov.in', 'Field Officer', 'officer');

-- Enable Row Level Security
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for demo purposes)
CREATE POLICY "Allow public read access to claims" ON public.claims FOR SELECT USING (true);
CREATE POLICY "Allow public read access to schemes" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow public read access to users" ON public.users FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update
CREATE POLICY "Allow authenticated users to insert claims" ON public.claims FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update claims" ON public.claims FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert schemes" ON public.schemes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update schemes" ON public.schemes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert documents" ON public.documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update documents" ON public.documents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert users" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update users" ON public.users FOR UPDATE USING (auth.role() = 'authenticated');
