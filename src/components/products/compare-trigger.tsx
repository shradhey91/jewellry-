
'use client';

import { useState } from 'react';
import { useCompare } from '@/hooks/use-compare';
import { Button } from '@/components/ui/button';
import { GitCompareArrows } from 'lucide-react';
import { CompareDrawer } from './compare-drawer';

export function CompareTrigger() {
    const { compareCount, isCompareReady } = useCompare();
    const [isOpen, setIsOpen] = useState(false);

    if (!isCompareReady || compareCount === 0) {
        return null;
    }

    return (
        <>
            <Button
                variant="default"
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 shadow-lg"
                onClick={() => setIsOpen(true)}
            >
                <GitCompareArrows className="mr-2 h-5 w-5" />
                Compare ({compareCount}/4)
            </Button>
            <CompareDrawer open={isOpen} onOpenChange={setIsOpen} />
        </>
    );
}
