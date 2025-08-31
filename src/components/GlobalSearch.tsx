import { useState, useEffect } from 'react';
import { Search, MapPin, User, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useClaims } from '@/hooks/useClaims';
import { useDocuments } from '@/hooks/useDocuments';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'claim' | 'village' | 'document';
  title: string;
  subtitle: string;
  description: string;
  url: string;
}

export function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { claims } = useClaims();
  const { documents } = useDocuments();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate search delay
    const timeout = setTimeout(() => {
      const searchLower = searchTerm.toLowerCase();
      const searchResults: SearchResult[] = [];

      // Search in claims
      if (claims) {
        claims.forEach(claim => {
          if (
            claim.applicantName.toLowerCase().includes(searchLower) ||
            claim.village.toLowerCase().includes(searchLower) ||
            claim.id.toLowerCase().includes(searchLower) ||
            claim.state.toLowerCase().includes(searchLower)
          ) {
            searchResults.push({
              id: claim.id,
              type: 'claim',
              title: claim.applicantName,
              subtitle: `${claim.village}, ${claim.state}`,
              description: `${claim.type} claim - ${claim.status}`,
              url: `/claims/${claim.id}`
            });
          }
        });
      }

      // Search in villages (unique villages from claims)
      if (claims) {
        const uniqueVillages = Array.from(new Set(claims.map(c => c.village)));
        uniqueVillages.forEach(village => {
          if (village.toLowerCase().includes(searchLower)) {
            const villageClaims = claims.filter(c => c.village === village);
            searchResults.push({
              id: village,
              type: 'village',
              title: village,
              subtitle: `${villageClaims.length} claims`,
              description: `Village with ${villageClaims.length} forest rights claims`,
              url: `/village/${village}`
            });
          }
        });
      }

      // Search in documents
      if (documents) {
        documents.forEach(doc => {
          if (
            doc.filename.toLowerCase().includes(searchLower) ||
            doc.extractedText.toLowerCase().includes(searchLower)
          ) {
            searchResults.push({
              id: doc.id,
              type: 'document',
              title: doc.filename,
              subtitle: doc.status,
              description: `Document uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`,
              url: `/documents/${doc.id}`
            });
          }
        });
      }

      setResults(searchResults.slice(0, 10)); // Limit to 10 results
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, claims, documents]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'claim':
        return <User className="w-4 h-4" />;
      case 'village':
        return <MapPin className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'claim':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'village':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'document':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search claims, villages, documents..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setSearchTerm('');
              setResults([]);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchTerm.length >= 2 || loading) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {result.title}
                          </h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getTypeColor(result.type)}`}
                          >
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {result.subtitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No results found for "{searchTerm}"
                </div>
              ) : null}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
