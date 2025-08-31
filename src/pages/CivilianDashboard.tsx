import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Clock, CheckCircle, XCircle, MapPin, User, Home, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getClaimsByUser, getDashboardStats, submitClaim } from '@/lib/fraApi';
import { FRAClaimWithDetails, ClaimSubmissionForm, DashboardStats, CLAIM_TYPES, CLAIM_STATUSES } from '@/lib/fraTypes';
import { extractTextFromPdf } from '@/lib/pdfUtils';

export default function CivilianDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [claims, setClaims] = useState<FRAClaimWithDetails[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState<ClaimSubmissionForm>({
    claim_type: 'IFR',
    applicant_name: '',
    father_name: '',
    tribe: '',
    village: '',
    block: '',
    district: '',
    state: '',
    land_area: 0,
    survey_number: '',
    pdf_file: null as any
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load claims and stats in parallel
      const [claimsResponse, statsResponse] = await Promise.all([
        getClaimsByUser(user.id, 'civilian'),
        getDashboardStats(user.id, 'civilian')
      ]);

      if (claimsResponse.success) {
        setClaims(claimsResponse.data || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data || null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFormChange = (field: keyof ClaimSubmissionForm, value: any) => {
    setClaimForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleClaimFormChange('pdf_file', file);

    try {
      // Extract text from PDF for metadata
      const extractedText = await extractTextFromPdf(file);
      
      // Auto-fill form fields based on extracted text
      const metadata = extractMetadataFromText(extractedText);
      
      setClaimForm(prev => ({
        ...prev,
        applicant_name: metadata.applicantName || prev.applicant_name,
        father_name: metadata.fatherName || prev.father_name,
        tribe: metadata.tribe || prev.tribe,
        village: metadata.village || prev.village,
        district: metadata.district || prev.district,
        state: metadata.state || prev.state,
        land_area: metadata.landArea || prev.land_area,
        survey_number: metadata.surveyNumber || prev.survey_number
      }));
    } catch (error) {
      console.error('Error processing PDF:', error);
    }
  };

  const extractMetadataFromText = (text: string) => {
    const metadata: any = {};
    
    // Extract applicant name
    const nameMatch = text.match(/Name:\s*([^\n\r]+)/i);
    if (nameMatch) metadata.applicantName = nameMatch[1].trim();

    // Extract father's name
    const fatherMatch = text.match(/Father['']?s?\s*Name:\s*([^\n\r]+)/i);
    if (fatherMatch) metadata.fatherName = fatherMatch[1].trim();

    // Extract tribe
    const tribeMatch = text.match(/Tribe:\s*([^\n\r]+)/i);
    if (tribeMatch) metadata.tribe = tribeMatch[1].trim();

    // Extract village
    const villageMatch = text.match(/Village:\s*([^\n\r]+)/i);
    if (villageMatch) metadata.village = villageMatch[1].trim();

    // Extract district
    const districtMatch = text.match(/District:\s*([^\n\r]+)/i);
    if (districtMatch) metadata.district = districtMatch[1].trim();

    // Extract state
    const stateMatch = text.match(/State:\s*([^\n\r]+)/i);
    if (stateMatch) metadata.state = stateMatch[1].trim();

    // Extract land area
    const areaMatch = text.match(/Area:\s*([^\d\.]+)\s*hectares?/i);
    if (areaMatch) metadata.landArea = parseFloat(areaMatch[1]);

    // Extract survey number
    const surveyMatch = text.match(/Survey\s*Number:\s*([^\n\r]+)/i);
    if (surveyMatch) metadata.surveyNumber = surveyMatch[1].trim();

    return metadata;
  };

  const handleSubmitClaim = async () => {
    if (!user || !claimForm.pdf_file) return;

    setSubmitting(true);
    try {
      const response = await submitClaim(claimForm, user.id);
      
      if (response.success) {
        // Reset form and reload data
        setClaimForm({
          claim_type: 'IFR',
          applicant_name: '',
          father_name: '',
          tribe: '',
          village: '',
          block: '',
          district: '',
          state: '',
          land_area: 0,
          survey_number: '',
          pdf_file: null as any
        });
        setShowClaimForm(false);
        await loadUserData();
      } else {
        alert('Failed to submit claim: ' + response.error);
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Submitted': return 'secondary';
      case 'Under Review': return 'default';
      case 'Approved': return 'default';
      case 'Granted': return 'default';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Civilian Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Civilian'}
          </p>
        </div>
        <Button onClick={() => setShowClaimForm(true)} className="gap-2">
          <Upload className="w-4 h-4" />
          Submit New Claim
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="claims">My Claims</TabsTrigger>
          <TabsTrigger value="submit">Submit Claim</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_claims}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending_claims}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approved_claims}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rejected_claims}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Claims */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>Your latest submitted claims</CardDescription>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No claims submitted yet.</p>
                  <p className="text-sm">Start by submitting your first FRA claim.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.slice(0, 5).map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{claim.claim_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {claim.claim_type} • {claim.village}, {claim.district}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(claim.claim_status)}>
                          {claim.claim_status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(claim.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Claims</CardTitle>
              <CardDescription>All your submitted FRA claims</CardDescription>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No claims found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{claim.claim_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {claim.claim_type} • {claim.village}, {claim.district}, {claim.state}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(claim.claim_status)}>
                          {claim.claim_status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Applicant:</span>
                          <div className="font-medium">{claim.applicant_name}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Land Area:</span>
                          <div className="font-medium">{claim.land_area} hectares</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submitted:</span>
                          <div className="font-medium">
                            {new Date(claim.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Survey No:</span>
                          <div className="font-medium">{claim.survey_number || 'N/A'}</div>
                        </div>
                      </div>

                      {claim.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {claim.rejection_reason}
                          </p>
                        </div>
                      )}

                      {claim.officer_notes && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Officer Notes:</strong> {claim.officer_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit Claim Tab */}
        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit New FRA Claim</CardTitle>
              <CardDescription>Upload your claim document and provide details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PDF Upload */}
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Upload Claim Document (PDF)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    id="pdf-upload"
                    className="hidden"
                  />
                  <Label htmlFor="pdf-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Choose PDF File</span>
                    </Button>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    {claimForm.pdf_file ? `Selected: ${claimForm.pdf_file.name}` : 'No file selected'}
                  </p>
                </div>
              </div>

              {/* Claim Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claim-type">Claim Type</Label>
                  <Select value={claimForm.claim_type} onValueChange={(value) => handleClaimFormChange('claim_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CLAIM_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicant-name">Applicant Name</Label>
                  <Input
                    id="applicant-name"
                    value={claimForm.applicant_name}
                    onChange={(e) => handleClaimFormChange('applicant_name', e.target.value)}
                    placeholder="Enter applicant name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="father-name">Father's Name</Label>
                  <Input
                    id="father-name"
                    value={claimForm.father_name}
                    onChange={(e) => handleClaimFormChange('father_name', e.target.value)}
                    placeholder="Enter father's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tribe">Tribe</Label>
                  <Input
                    id="tribe"
                    value={claimForm.tribe}
                    onChange={(e) => handleClaimFormChange('tribe', e.target.value)}
                    placeholder="Enter tribe name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Input
                    id="village"
                    value={claimForm.village}
                    onChange={(e) => handleClaimFormChange('village', e.target.value)}
                    placeholder="Enter village name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block">Block</Label>
                  <Input
                    id="block"
                    value={claimForm.block}
                    onChange={(e) => handleClaimFormChange('block', e.target.value)}
                    placeholder="Enter block name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={claimForm.district}
                    onChange={(e) => handleClaimFormChange('district', e.target.value)}
                    placeholder="Enter district name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={claimForm.state}
                    onChange={(e) => handleClaimFormChange('state', e.target.value)}
                    placeholder="Enter state name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="land-area">Land Area (hectares)</Label>
                  <Input
                    id="land-area"
                    type="number"
                    step="0.01"
                    value={claimForm.land_area}
                    onChange={(e) => handleClaimFormChange('land_area', parseFloat(e.target.value) || 0)}
                    placeholder="Enter land area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="survey-number">Survey Number</Label>
                  <Input
                    id="survey-number"
                    value={claimForm.survey_number}
                    onChange={(e) => handleClaimFormChange('survey_number', e.target.value)}
                    placeholder="Enter survey number"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitClaim} 
                  disabled={submitting || !claimForm.pdf_file}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setClaimForm({
                    claim_type: 'IFR',
                    applicant_name: '',
                    father_name: '',
                    tribe: '',
                    village: '',
                    block: '',
                    district: '',
                    state: '',
                    land_area: 0,
                    survey_number: '',
                    pdf_file: null as any
                  })}
                >
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
