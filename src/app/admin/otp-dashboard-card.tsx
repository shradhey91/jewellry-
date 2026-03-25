'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toggleOtpViewerAction, clearOtpsAction } from './otp-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface OtpDashboardCardProps {
  initialIsEnabled: boolean;
  initialOtps: { phone: string, otp: string, expires: number }[];
}

export function OtpDashboardCard({ initialIsEnabled, initialOtps }: OtpDashboardCardProps) {
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [otps, setOtps] = useState(initialOtps);
  const [isToggling, startToggleTransition] = useTransition();
  const [isClearing, startClearingTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleToggle = (checked: boolean) => {
    startToggleTransition(async () => {
      await toggleOtpViewerAction(checked);
      setIsEnabled(checked);
      toast({
        title: 'Setting Updated',
        description: `OTP viewer has been ${checked ? 'enabled' : 'disabled'}.`,
      });
      router.refresh();
    });
  };

  const handleClear = () => {
      startClearingTransition(async () => {
          await clearOtpsAction();
          setOtps([]);
          toast({
              title: 'OTPs Cleared',
              description: 'The temporary OTP list has been cleared.',
          });
          router.refresh();
      });
  };

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Temporary OTP Viewer</CardTitle>
                <CardDescription>For testing the customer login flow. New OTPs appear here when requested.</CardDescription>
            </div>
             <div className="flex items-center space-x-2">
                {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <Label htmlFor="otp-switch">Show OTPs</Label>
                <Switch id="otp-switch" checked={isEnabled} onCheckedChange={handleToggle} disabled={isToggling} />
            </div>
        </div>
      </CardHeader>
      {isEnabled && (
        <CardContent>
            {otps.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>OTP</TableHead>
                            <TableHead>Expires</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {otps.map(entry => (
                            <TableRow key={entry.otp}>
                                <TableCell>{entry.phone}</TableCell>
                                <TableCell className="font-mono font-bold">{entry.otp}</TableCell>
                                <TableCell>{formatDistanceToNow(new Date(entry.expires), { addSuffix: true })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-center text-muted-foreground py-8">No OTPs have been generated yet. Try logging in as a customer.</p>
            )}
        </CardContent>
      )}
       {isEnabled && (
           <CardFooter>
               <Button variant="destructive" onClick={handleClear} disabled={isClearing}>
                   {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                   Clear OTP List
               </Button>
           </CardFooter>
       )}
    </Card>
  );
}
