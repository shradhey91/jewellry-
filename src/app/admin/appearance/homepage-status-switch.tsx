'use client';

import { useState, useTransition } from 'react';
import { setHomepageEnabled } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function HomepageStatusSwitch({ isEnabled: initialIsEnabled }: { isEnabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await setHomepageEnabled(checked);
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      if (result.success) {
        setIsEnabled(checked);
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      <Label htmlFor="homepage-master-switch">Homepage Enabled</Label>
      <Switch
        id="homepage-master-switch"
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
    </div>
  );
}
