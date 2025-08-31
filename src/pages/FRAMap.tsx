import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, Loader2 } from 'lucide-react';

export default function FRAMap() {
  useEffect(() => {
    // Automatically open the external FRA Atlas website when this page is accessed
    const timer = setTimeout(() => {
      window.open('https://forest-rights-act-fr-1yxt.bolt.host/', '_blank');
    }, 1000); // 1 second delay to show the loading message

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md mx-4 text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Opening FRA Atlas</CardTitle>
          <CardDescription>
            Redirecting you to the official Forest Rights Act Atlas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Opening external website...</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>You will be redirected to the comprehensive FRA Atlas in a new tab.</p>
            <p className="mt-2">If the page doesn't open automatically, click the button below:</p>
          </div>

          <Button 
            onClick={() => window.open('https://forest-rights-act-fr-1yxt.bolt.host/', '_blank')}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open FRA Atlas
          </Button>

          <p className="text-xs text-muted-foreground">
            The external FRA Atlas provides comprehensive mapping and data for Forest Rights Act implementation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
