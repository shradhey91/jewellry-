
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Upload, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import { bulkUploadProductsAction, BulkUploadState } from './actions';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
      ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Start Bulk Upload
          </>
      )}
    </Button>
  );
}

function ResultsAlert({ results }: { results: BulkUploadState['results'] }) {
    if (!results) return null;

    const isSuccess = results.failed === 0;

    return (
        <Alert variant={isSuccess ? 'default' : 'destructive'}>
            {isSuccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>Upload Complete</AlertTitle>
            <AlertDescription>
                <p>
                    {results.successful} of {results.total} products uploaded successfully.
                    {results.failed > 0 && ` ${results.failed} failed.`}
                </p>
                {results.errors.length > 0 && (
                    <div className="mt-2 text-xs">
                        <p className="font-semibold">Error Details:</p>
                        <ul className="list-disc pl-4 max-h-40 overflow-y-auto">
                            {results.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </AlertDescription>
        </Alert>
    );
}


export default function BulkUploadPage() {
  const initialState: BulkUploadState = { message: '', success: false };
  const [state, formAction] = useFormState(bulkUploadProductsAction, initialState);

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Bulk Product Upload"
        description="Add multiple products at once using a CSV file."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Upload Your CSV File</CardTitle>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="dataFile">Product Data File (CSV)</Label>
                    <Input id="dataFile" name="dataFile" type="file" accept=".csv" required />
                </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
           {state.message && (
                <div className="p-6 pt-0">
                    {state.results ? (
                        <ResultsAlert results={state.results} />
                    ) : (
                         <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
        </Card>
        
        <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                 <div className="flex items-start gap-4">
                    <ImageIcon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-foreground">1. Upload Media</h4>
                        <p>First, upload all your product images and videos via the <Link href="/admin/media" className="underline">Media Library</Link>.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-foreground">2. Prepare CSV</h4>
                        <p>Use the sample file as a template. In the `media_1`, `media_2`, etc., columns, list the exact filenames for each product as they appear in the Media Library.</p>
                         <a href="/sample-products.csv" download="sample-products.csv" className="text-primary underline text-xs font-semibold">Download Sample CSV</a>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Upload className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-foreground">3. Upload CSV</h4>
                        <p>Select your completed CSV file and click "Start Bulk Upload". The system will match filenames to your media library and create the products.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
