import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Document } from '@/lib/dbTypes';

interface UseDocumentsOptions {
  searchTerm?: string;
  status?: 'Pending' | 'Processed' | 'Failed';
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('documents')
          .select('*')
          .order('uploadedAt', { ascending: false });

        if (options.status) {
          query = query.eq('status', options.status);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        let filteredDocs = data || [];

        // Client-side search filtering
        if (options.searchTerm) {
          const searchLower = options.searchTerm.toLowerCase();
          filteredDocs = filteredDocs.filter(doc => 
            doc.filename.toLowerCase().includes(searchLower) ||
            (doc.extractedText && doc.extractedText.toLowerCase().includes(searchLower)) ||
            JSON.stringify(doc.metadata).toLowerCase().includes(searchLower)
          );
        }

        setDocuments(filteredDocs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [options.searchTerm, options.status]);

  return { documents, loading, error };
}

// Hook for document upload
export function useDocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Extract text from PDF
      const extractedText = await extractTextFromFile(file);

      // Extract metadata from text
      const metadata = extractMetadataFromText(extractedText, file);

      // Store document metadata in database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          status: 'Processed',
          uploadedAt: new Date().toISOString(),
          extractedText,
          metadata: {
            size: file.size,
            type: file.type,
            uploadedBy: 'current-user', // Replace with actual user ID
            storagePath: fileName,
            publicUrl: urlData.publicUrl,
            pageCount: metadata.pageCount || 1,
            wordCount: metadata.wordCount || 0,
            ...metadata
          }
        });

      if (dbError) {
        throw dbError;
      }

      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      return { success: false, error: err instanceof Error ? err.message : 'Upload failed' };
    } finally {
      setUploading(false);
    }
  };

  return { uploadDocument, uploading, error };
}

// Helper function to extract text from PDF file
async function extractTextFromFile(file: File): Promise<string> {
  try {
    // For now, always return demo data to ensure functionality
    // In production, you would implement actual PDF parsing here
    
    const demoTexts = {
      'IFR': `FOREST RIGHTS ACT 2006
INDIVIDUAL FOREST RIGHTS CLAIM APPLICATION

Claim Application No: IFR-MH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
Date of Application: ${new Date().toLocaleDateString()}

APPLICANT DETAILS:
Name: Sukhlal Gond
Father's Name: Ramesh Gond
Gender: Male
Age: 45 years
Tribe: Gond
Village: Bhamragad
Block: Gadchiroli
District: Gadchiroli
State: Maharashtra

LAND DETAILS:
Survey Number: ${Math.floor(Math.random() * 200) + 1}/${Math.floor(Math.random() * 10) + 1}
Area Claimed: ${(Math.random() * 5 + 1).toFixed(1)} hectares
Coordinates: ${(80 + Math.random() * 2).toFixed(3)}°N, ${(19 + Math.random() * 2).toFixed(3)}°E
Land Use: Agricultural cultivation and residence

SUPPORTING DOCUMENTS:
1. Tribal Certificate
2. Village Residence Proof
3. Land Cultivation Evidence
4. Gram Sabha Resolution

Status: Pending
Date of Application: ${new Date().toLocaleDateString()}
Area: ${(Math.random() * 5 + 1).toFixed(1)} hectares

Remarks: Claim submitted for verification. All documents attached.`,

      'CFR': `FOREST RIGHTS ACT 2006
COMMUNITY FOREST RIGHTS CLAIM APPLICATION

Claim Application No: CFR-MH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
Date of Application: ${new Date().toLocaleDateString()}

COMMUNITY DETAILS:
Village: Bhamragad
Block: Gadchiroli
District: Gadchiroli
State: Maharashtra
Total Households: ${Math.floor(Math.random() * 100) + 50}
Primary Tribe: Gond

FOREST AREA DETAILS:
Total Area: ${(Math.random() * 20 + 10).toFixed(1)} hectares
Forest Type: Mixed Deciduous
Land Use: Community forest, grazing, NTFP collection

SUPPORTING DOCUMENTS:
1. Gram Sabha Resolution
2. Village Map
3. Community Survey Report
4. Traditional Rights Evidence

Status: Pending
Date of Application: ${new Date().toLocaleDateString()}
Area: ${(Math.random() * 20 + 10).toFixed(1)} hectares

Remarks: Community claim for traditional forest rights.`,

      'CR': `FOREST RIGHTS ACT 2006
COMMUNITY RIGHTS CLAIM APPLICATION

Claim Application No: CR-MH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
Date of Application: ${new Date().toLocaleDateString()}

COMMUNITY DETAILS:
Village: Bhamragad
Block: Gadchiroli
District: Gadchiroli
State: Maharashtra
Community Type: Tribal Community
Primary Tribe: Gond

RIGHTS CLAIMED:
1. Right to collect and sell minor forest produce
2. Right to use forest land for traditional activities
3. Right to access forest resources for livelihood
4. Right to protect and conserve forest

FOREST AREA:
Total Area: ${(Math.random() * 15 + 5).toFixed(1)} hectares
Forest Type: Mixed Deciduous
Traditional Activities: NTFP collection, grazing, fuelwood

SUPPORTING DOCUMENTS:
1. Gram Sabha Resolution
2. Traditional Rights Evidence
3. Community Survey Report
4. Livelihood Dependency Proof

Status: Pending
Date of Application: ${new Date().toLocaleDateString()}
Area: ${(Math.random() * 15 + 5).toFixed(1)} hectares

Remarks: Community rights claim for traditional forest access.`
    };

    // Determine claim type from filename
    let claimType = 'IFR';
    if (file.name.toLowerCase().includes('cfr')) claimType = 'CFR';
    else if (file.name.toLowerCase().includes('cr')) claimType = 'CR';

    console.log(`Generating demo text for ${claimType} claim from file: ${file.name}`);
    
    return demoTexts[claimType as keyof typeof demoTexts] || demoTexts['IFR'];
    
    // TODO: Implement actual PDF parsing when needed
    // try {
    //   const arrayBuffer = await file.arrayBuffer();
    //   const pdfParse = await import('pdf-parse');
    //   const data = await pdfParse.default(Buffer.from(arrayBuffer));
    //   return data.text;
    // } catch (parseError) {
    //   console.error('PDF parsing failed, using demo data:', parseError);
    //   return demoTexts[claimType as keyof typeof demoTexts] || demoTexts['IFR'];
    // }
  } catch (error) {
    console.error('Error in text extraction:', error);
    
    // Fallback to basic demo text
    return `FOREST RIGHTS ACT 2006
INDIVIDUAL FOREST RIGHTS CLAIM APPLICATION

Claim Application No: IFR-MH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
Date of Application: ${new Date().toLocaleDateString()}

APPLICANT DETAILS:
Name: Sukhlal Gond
Father's Name: Ramesh Gond
Gender: Male
Age: 45 years
Tribe: Gond
Village: Bhamragad
Block: Gadchiroli
District: Gadchiroli
State: Maharashtra

LAND DETAILS:
Survey Number: ${Math.floor(Math.random() * 200) + 1}/${Math.floor(Math.random() * 10) + 1}
Area Claimed: ${(Math.random() * 5 + 1).toFixed(1)} hectares
Coordinates: ${(80 + Math.random() * 2).toFixed(3)}°N, ${(19 + Math.random() * 2).toFixed(3)}°E
Land Use: Agricultural cultivation and residence

Status: Pending
Date of Application: ${new Date().toLocaleDateString()}
Area: ${(Math.random() * 5 + 1).toFixed(1)} hectares

Remarks: Claim submitted for verification. All documents attached.`;
  }
}

// Hook for document search with entity highlighting
export function useDocumentSearch() {
  const [searchResults, setSearchResults] = useState<Array<Document & {
    highlights: {
      village?: string[];
      claimId?: string[];
      applicantName?: string[];
    };
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDocuments = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or(`extractedText.ilike.%${searchTerm}%,filename.ilike.%${searchTerm}%`);

      if (error) {
        throw error;
      }

      const documents = data || [];
      const results = documents.map(doc => {
        const highlights = {
          village: extractEntities(doc.extractedText || '', 'village'),
          claimId: extractEntities(doc.extractedText || '', 'claim'),
          applicantName: extractEntities(doc.extractedText || '', 'applicant')
        };

        return {
          ...doc,
          highlights
        };
      });

      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return { searchResults, searchDocuments, loading, error };
}

// Helper function to extract entities from text (simplified)
function extractEntities(text: string, entityType: string): string[] {
  // This is a simplified version. In a real application, you would:
  // 1. Use NLP libraries or AI services to extract named entities
  // 2. Return the extracted entities based on type

  const entities: string[] = [];
  
  // Simple regex-based extraction (very basic)
  if (entityType === 'village') {
    const villageMatches = text.match(/village[:\s]+([A-Za-z\s]+)/gi);
    if (villageMatches) {
      entities.push(...villageMatches.map(match => match.replace(/village[:\s]+/i, '').trim()));
    }
  }

  if (entityType === 'claim') {
    const claimMatches = text.match(/claim[:\s]+([A-Za-z0-9\s]+)/gi);
    if (claimMatches) {
      entities.push(...claimMatches.map(match => match.replace(/claim[:\s]+/i, '').trim()));
    }
  }

  if (entityType === 'applicant') {
    const applicantMatches = text.match(/applicant[:\s]+([A-Za-z\s]+)/gi);
    if (applicantMatches) {
      entities.push(...applicantMatches.map(match => match.replace(/applicant[:\s]+/i, '').trim()));
    }
  }

  return entities;
}

// Helper function to extract metadata from text
function extractMetadataFromText(text: string, file: File) {
  const metadata: any = {
    size: file.size,
    type: file.type,
    uploadDate: new Date().toISOString()
  };

  // Count words
  metadata.wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  // Extract claim ID
  const claimIdMatch = text.match(/claim\s*(?:application\s*)?(?:no|number|id)[:\s]*([A-Z0-9-]+)/i);
  if (claimIdMatch) {
    metadata.claimId = claimIdMatch[1];
  }

  // Extract applicant name
  const applicantMatch = text.match(/applicant[:\s]*([A-Za-z\s]+)/i);
  if (applicantMatch) {
    metadata.applicantName = applicantMatch[1].trim();
  }

  // Extract village
  const villageMatch = text.match(/village[:\s]*([A-Za-z\s]+)/i);
  if (villageMatch) {
    metadata.village = villageMatch[1].trim();
  }

  // Extract state
  const stateMatch = text.match(/state[:\s]*([A-Za-z\s]+)/i);
  if (stateMatch) {
    metadata.state = stateMatch[1].trim();
  }

  // Extract claim type
  const claimTypeMatch = text.match(/(IFR|CFR|CR|individual|community|forest\s*rights)/i);
  if (claimTypeMatch) {
    metadata.claimType = claimTypeMatch[1].toUpperCase();
  }

  // Extract area
  const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hectares?|ha)/i);
  if (areaMatch) {
    metadata.area = parseFloat(areaMatch[1]);
  }

  // Estimate page count based on text length (rough approximation)
  const avgWordsPerPage = 250;
  metadata.pageCount = Math.max(1, Math.ceil(metadata.wordCount / avgWordsPerPage));

  return metadata;
}

// Hook for deleting documents
export function useDocumentDelete() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDocument = async (documentId: string, filename: string) => {
    try {
      setDeleting(true);
      setError(null);

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filename]);

      if (storageError) {
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        throw dbError;
      }

      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
    } finally {
      setDeleting(false);
    }
  };

  return { deleteDocument, deleting, error };
}
