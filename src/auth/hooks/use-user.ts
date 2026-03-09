
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';

interface UserHook {
    user: User | null;
    isLoading: boolean;
}

export function useUser(): UserHook {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/session');
                const data = await res.json();
                setUser(data.user);
            } catch (error) {
                console.error("Failed to fetch user session", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, isLoading };
}
