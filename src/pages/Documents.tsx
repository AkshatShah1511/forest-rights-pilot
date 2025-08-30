import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Eye, 
  Download, 
  Search, 
  MapPin, 
  User, 
  FileText, 
  Target,
  Save,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock document data
const mockDocuments = [
  {
    id: 'doc-001',
    name: 'IFR_Claim_Sukhlal_Gond.pdf',
    type: 'IFR Application',
    uploadDate: '2024-01-15',
    status: 'Processed',
    thumbnail: '/api/placeholder/150/200'
  },
  {
    id: 'doc-002', 
    name: 'CFR_Survey_Bhamragad.pdf',
    type: 'CFR Survey',
    uploadDate: '2024-01-12',
    status: 'Processed',
    thumbnail: '/api/placeholder/150/200'
  },
  {
    id: 'doc-003',
    name: 'Legacy_Records_Block_7.pdf',
    type: 'Legacy Record',
    uploadDate: '2024-01-10',
    status: 'Processing',
    thumbnail: '/api/placeholder/150/200'
  }
];

// Mock extracted text with NER data
const mockExtractedText = `FOREST RIGHTS ACT 2006
INDIVIDUAL FOREST RIGHTS CLAIM APPLICATION

Claim Application No: IFR-MH-0001
Date of Application: 15th January 2024

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
Survey Number: 124/2
Area Claimed: 1.8 hectares
Coordinates: 80.412°N, 19.652°E
Land Use: Agricultural cultivation and residence

SUPPORTING DOCUMENTS:
1. Tribal Certificate
2. Village Residence Proof
3. Land Cultivation Evidence
4. Gram Sabha Resolution

Status: Approved
Date of Approval: 28th February 2024
Approved Area: 1.8 hectares

Remarks: Claim verified through field inspection. All documents found in order.`;

const nerEntities = [
  { type: 'Holder Name', value: 'Sukhlal Gond', positions: [[92, 104]] },
  { type: 'Village', value: 'Bhamragad', positions: [[234, 244]] },
  { type: 'Coordinates', value: '80.412°N, 19.652°E', positions: [[350, 368]] },
  { type: 'Claim Type', value: 'IFR', positions: [[67, 70]] },
  { type: 'Area (ha)', value: '1.8', positions: [[320, 323], [547, 550]] },
  { type: 'Status', value: 'Approved', positions: [[487, 495], [524, 532]] }
];

export default function Documents() {
  const [selectedDoc, setSelectedDoc] = useState(mockDocuments[0]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState({
    holderName: 'Sukhlal Gond',
    village: 'Bhamragad',
    coordinates: '80.412°N, 19.652°E',
    claimType: 'IFR',
    areaHa: '1.8',
    status: 'Approved'
  });
  
  const { toast } = useToast();

  const handleEntityClick = (entityType: string) => {
    setSelectedEntity(selectedEntity === entityType ? null : entityType);
  };

  const highlightText = (text: string) => {
    if (!selectedEntity) return text;
    
    const entity = nerEntities.find(e => e.type === selectedEntity);
    if (!entity) return text;

    let highlightedText = text;
    entity.positions.forEach(([start, end]) => {
      const before = highlightedText.substring(0, start);
      const highlighted = highlightedText.substring(start, end);
      const after = highlightedText.substring(end);
      highlightedText = before + `<mark class="bg-yellow-200 dark:bg-yellow-800">${highlighted}</mark>` + after;
    });

    return highlightedText;
  };

  const handleSave = () => {
    toast({
      title: "Data Saved",
      description: "Extracted document data has been saved successfully.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      toast({
        title: "Upload Disabled",
        description: "File upload is disabled in this demo version.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Document List */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-4">Document OCR/NER Viewer</h2>
          
          {/* Upload Zone */}
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center mb-4">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop files here or click to upload
            </p>
            <Input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              multiple
            />
            <Label htmlFor="file-upload">
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                <span>Browse Files</span>
              </Button>
            </Label>
            <Badge variant="secondary" className="mt-2 text-xs">Demo: Upload Disabled</Badge>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search documents..." className="pl-10" />
          </div>
        </div>

        {/* Document Thumbnails */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {mockDocuments.map((doc) => (
              <Card 
                key={doc.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDoc.id === doc.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedDoc(doc)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={doc.status === 'Processed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {doc.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{selectedDoc.name}</h1>
            <p className="text-sm text-muted-foreground">
              {selectedDoc.type} • Uploaded {new Date(selectedDoc.uploadDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              View Original
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 flex">
          {/* Original Document View */}
          <div className="flex-1 p-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Original Document</CardTitle>
                <CardDescription>Scanned document image</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Document viewer would display here
                  </p>
                  <Badge variant="secondary" className="mt-2">Mock Preview</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extracted Content */}
          <div className="flex-1 p-4 border-l border-border">
            <Tabs defaultValue="extracted" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="extracted">Extracted Text</TabsTrigger>
                <TabsTrigger value="metadata">Metadata Form</TabsTrigger>
              </TabsList>

              <TabsContent value="extracted" className="flex-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Named Entity Recognition
                    </CardTitle>
                    <CardDescription>
                      Click on entity types to highlight them in the text
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {nerEntities.map((entity) => (
                        <Button
                          key={entity.type}
                          variant={selectedEntity === entity.type ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleEntityClick(entity.type)}
                          className="gap-2"
                        >
                          {entity.type === 'Holder Name' && <User className="w-3 h-3" />}
                          {entity.type === 'Village' && <MapPin className="w-3 h-3" />}
                          {entity.type === 'Coordinates' && <Target className="w-3 h-3" />}
                          {entity.type}
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {entity.positions.length}
                          </Badge>
                        </Button>
                      ))}
                    </div>

                    <Separator className="mb-4" />

                    <ScrollArea className="h-96 border rounded-lg p-4 bg-muted/20">
                      <div 
                        className="text-sm font-mono leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: highlightText(mockExtractedText) }}
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metadata" className="flex-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extracted Metadata</CardTitle>
                    <CardDescription>
                      Structured data extracted from the document
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="holderName">Holder Name</Label>
                        <Input
                          id="holderName"
                          value={extractedData.holderName}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, holderName: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="village">Village</Label>
                        <Input
                          id="village"
                          value={extractedData.village}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, village: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coordinates">Coordinates</Label>
                        <Input
                          id="coordinates"
                          value={extractedData.coordinates}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, coordinates: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="claimType">Claim Type</Label>
                        <Input
                          id="claimType"
                          value={extractedData.claimType}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, claimType: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="areaHa">Area (ha)</Label>
                        <Input
                          id="areaHa"
                          type="number"
                          step="0.1"
                          value={extractedData.areaHa}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, areaHa: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Input
                          id="status"
                          value={extractedData.status}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, status: e.target.value }))}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-2 p-3 bg-info-light rounded-lg">
                      <AlertCircle className="w-4 h-4 text-info" />
                      <p className="text-sm text-info-foreground">
                        Data validation successful. All required fields extracted.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save Metadata
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export as JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}