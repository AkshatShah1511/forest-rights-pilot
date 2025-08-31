import { useState, useEffect } from 'react';
import { extractTextFromPdf } from "@/lib/pdfUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertCircle, Clock, File, Database, Search } from 'lucide-react';

interface UploadedDocument {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'error';
  extractedText?: string;
  metadata?: {
    pages?: number;
    words?: number;
    claimType?: string;
    applicantName?: string;
    village?: string;
    state?: string;
    area?: string;
    coordinates?: string;
  };
  error?: string;
}

function Documents() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load documents from localStorage on component mount
  useEffect(() => {
    const savedDocs = localStorage.getItem('fra-uploaded-documents');
    if (savedDocs) {
      try {
        const docs = JSON.parse(savedDocs);
        // Convert date strings back to Date objects
        const parsedDocs = docs.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate),
          file: null // File objects can't be serialized, so we'll set to null
        }));
        setUploadedDocuments(parsedDocs);
      } catch (error) {
        console.error('Error loading saved documents:', error);
      }
    }
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fra-uploaded-documents', JSON.stringify(uploadedDocuments));
  }, [uploadedDocuments]);

  const extractMetadata = (text: string, filename: string) => {
    const metadata: any = {};
    
    // Extract claim type from filename
    if (filename.toLowerCase().includes('ifr')) metadata.claimType = 'IFR';
    else if (filename.toLowerCase().includes('cfr')) metadata.claimType = 'CFR';
    else if (filename.toLowerCase().includes('cr')) metadata.claimType = 'CR';
    else metadata.claimType = 'Unknown';

    // Extract applicant name (look for patterns like "Name: [Name]")
    const nameMatch = text.match(/Name:\s*([^\n\r]+)/i);
    if (nameMatch) metadata.applicantName = nameMatch[1].trim();

    // Extract village (look for patterns like "Village: [Village]")
    const villageMatch = text.match(/Village:\s*([^\n\r]+)/i);
    if (villageMatch) metadata.village = villageMatch[1].trim();

    // Extract state (look for patterns like "State: [State]")
    const stateMatch = text.match(/State:\s*([^\n\r]+)/i);
    if (stateMatch) metadata.state = stateMatch[1].trim();

    // Extract area (look for patterns like "Area: [Area]")
    const areaMatch = text.match(/Area:\s*([^\n\r\s]+)\s*hectares?/i);
    if (areaMatch) metadata.area = areaMatch[1].trim();

    // Extract coordinates (look for coordinate patterns)
    const coordMatch = text.match(/(\d+\.\d+)[°°]\s*[NS],\s*(\d+\.\d+)[°°]\s*[EW]/i);
    if (coordMatch) metadata.coordinates = `${coordMatch[1]}°N, ${coordMatch[2]}°E`;

    // Calculate word count
    metadata.words = text.split(/\s+/).length;

    return metadata;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Please select a valid PDF file');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      console.log("Uploaded file:", file.name);

      // Create document object
      const newDoc: UploadedDocument = {
        id: Date.now().toString(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        status: 'processing'
      };

      // Add to documents list
      setUploadedDocuments(prev => [newDoc, ...prev]);

      // Extract text from PDF
      try {
        const text = await extractTextFromPdf(file);
        const metadata = extractMetadata(text, file.name);
        
        // Update document with extracted data
        setUploadedDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id 
            ? { ...doc, status: 'completed', extractedText: text, metadata }
            : doc
        ));

        setUploadStatus('success');
        setUploadMessage(`Successfully processed ${file.name}`);
        console.log("Extracted PDF text:", text);
        console.log("Extracted metadata:", metadata);
        
      } catch (parseError) {
        console.error("Error parsing PDF:", parseError);
        setUploadedDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id 
            ? { ...doc, status: 'error', error: 'Failed to parse PDF' }
            : doc
        ));
        throw new Error('Failed to parse PDF content');
      }
      
    } catch (err) {
      console.error("Error processing file:", err);
      setUploadStatus('error');
      setUploadMessage(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = e.dataTransfer.files;
      input.accept = 'application/pdf';
      input.onchange = (e) => handleFileUpload(e as any);
      input.click();
    }
  };

  const deleteDocument = (id: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const filteredDocuments = uploadedDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.metadata?.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.metadata?.village?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
        <p className="text-muted-foreground">Upload and process PDF documents for FRA claims</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="data">Extracted Data</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                PDF Upload & Processing
              </CardTitle>
              <CardDescription>
                Upload PDF documents to extract text and metadata for forest rights claims
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your PDF here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse files
                </p>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploading}
                />
                <Label htmlFor="pdf-upload">
                  <Button asChild disabled={isUploading}>
                    <span>
                      {isUploading ? 'Processing...' : 'Choose PDF File'}
                    </span>
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum file size: 10MB
                </p>
              </div>

              {/* Upload Status */}
              {uploadStatus !== 'idle' && (
                <Alert className={uploadStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {uploadStatus === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={uploadStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {uploadMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="w-5 h-5" />
                Recent Uploads
              </CardTitle>
              <CardDescription>
                Your recently uploaded and processed documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search documents by name, applicant, or village..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Documents List */}
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet.</p>
                  <p className="text-sm">Start by uploading your first PDF document.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{doc.name}</span>
                            <Badge variant={doc.status === 'completed' ? 'default' : doc.status === 'processing' ? 'secondary' : 'destructive'}>
                              {doc.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Size:</span> {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            <div>
                              <span className="font-medium">Uploaded:</span> {doc.uploadDate.toLocaleDateString()}
                            </div>
                            {doc.metadata?.claimType && (
                              <div>
                                <span className="font-medium">Type:</span> {doc.metadata.claimType}
                              </div>
                            )}
                            {doc.metadata?.applicantName && (
                              <div>
                                <span className="font-medium">Applicant:</span> {doc.metadata.applicantName}
                              </div>
                            )}
                          </div>

                          {doc.error && (
                            <div className="mt-2 text-sm text-red-600">
                              Error: {doc.error}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Extracted Data & Metadata
              </CardTitle>
              <CardDescription>
                View extracted text and structured metadata from processed documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedDocuments.filter(doc => doc.status === 'completed').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No processed documents available.</p>
                  <p className="text-sm">Upload and process PDFs to see extracted data here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {uploadedDocuments
                    .filter(doc => doc.status === 'completed')
                    .map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {doc.name}
                        </h3>

                        {/* Metadata Section */}
                        {doc.metadata && (
                          <div className="mb-4">
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Extracted Metadata</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {doc.metadata.claimType && (
                                <div className="bg-muted p-2 rounded">
                                  <span className="text-xs text-muted-foreground">Claim Type</span>
                                  <div className="font-medium">{doc.metadata.claimType}</div>
                                </div>
                              )}
                              {doc.metadata.applicantName && (
                                <div className="bg-muted p-2 rounded">
                                  <span className="text-xs text-muted-foreground">Applicant</span>
                                  <div className="font-medium">{doc.metadata.applicantName}</div>
                                </div>
                              )}
                              {doc.metadata.village && (
                                <div className="bg-muted p-2 rounded">
                                  <span className="text-xs text-muted-foreground">Village</span>
                                  <div className="font-medium">{doc.metadata.village}</div>
                                </div>
                              )}
                              {doc.metadata.state && (
                                <div className="bg-muted p-2 rounded">
                                  <span className="text-xs text-muted-foreground">State</span>
                                  <div className="font-medium">{doc.metadata.state}</div>
                                </div>
                              )}
                              {doc.metadata.area && (
                                <div className="bg-muted p-2 rounded">
                                  <span className="text-xs text-muted-foreground">Area</span>
                                  <div className="font-medium">{doc.metadata.area} ha</div>
                                </div>
                              )}
                              {doc.metadata.coordinates && (
                                <div className="bg-muted p-2 rounded">
                                  <span className="text-xs text-muted-foreground">Coordinates</span>
                                  <div className="font-medium">{doc.metadata.coordinates}</div>
                                </div>
                              )}
                              {doc.metadata.words && (
                                <div className="bg-muted p-2 rounded">
                                  <span className="text-xs text-muted-foreground">Word Count</span>
                                  <div className="font-medium">{doc.metadata.words}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Extracted Text Section */}
                        {doc.extractedText && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Extracted Text</h4>
                            <div className="bg-muted p-3 rounded-lg max-h-64 overflow-y-auto">
                              <pre className="text-sm whitespace-pre-wrap font-mono">{doc.extractedText}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Documents;
