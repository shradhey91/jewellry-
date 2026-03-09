
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { SocialProofSettings, Product } from '@/lib/types';

const MIN_TIME_BETWEEN_NOTIFICATIONS = 2000;
const MAX_TIME_BETWEEN_NOTIFICATIONS = 15000;
const DISPLAY_DURATION = 5000;
const ANIMATION_DURATION = 500;

interface SocialProofData {
    settings: SocialProofSettings;
    products: Product[];
}

interface NotificationData {
    name: string;
    productName: string;
    productImage: string;
}

interface NotificationItem extends NotificationData {
    id: string;
    isShowing: boolean;
}

export function SocialProofNotification() {
    const [data, setData] = useState<SocialProofData | null>(null);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const isMobile = useIsMobile();
    const timeouts = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/social-proof');
                if (!response.ok) throw new Error('Failed to fetch social proof data');
                const socialProofData: SocialProofData = await response.json();
                setData(socialProofData);
            } catch (error) {
                console.error("Error fetching social proof data:", error);
            }
        };
        fetchData();
        
        return () => {
            timeouts.current.forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];

        if (!data || !data.settings.isEnabled || (isMobile && !data.settings.showOnMobile)) {
            return;
        }

        const { customNames } = data.settings;
        const { products } = data;

        if (!customNames || customNames.length === 0 || !products || products.length === 0) {
            return;
        }

        const addNotification = () => {
            const randomName = customNames[Math.floor(Math.random() * customNames.length)];
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            
            if (!randomName || !randomProduct) return;

            const primaryImage = randomProduct.media?.find(m => m.is_primary)?.url || 'https://picsum.photos/seed/placeholder/100/100';

            const newNotification: NotificationItem = {
                id: `notif-${Date.now()}-${Math.random()}`,
                name: randomName,
                productName: randomProduct.name,
                productImage: primaryImage,
                isShowing: false,
            };

            setNotifications(prev => [...prev, newNotification]);

            const showTimeout = setTimeout(() => {
                setNotifications(prev =>
                    prev.map(n => n.id === newNotification.id ? { ...n, isShowing: true } : n)
                );
            }, 100);

            const hideTimeout = setTimeout(() => {
                setNotifications(prev =>
                    prev.map(n => n.id === newNotification.id ? { ...n, isShowing: false } : n)
                );
            }, DISPLAY_DURATION);
            
            const removeTimeout = setTimeout(() => {
                 setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
            }, DISPLAY_DURATION + ANIMATION_DURATION);

            timeouts.current.push(showTimeout, hideTimeout, removeTimeout);
        };
        
        const scheduleNext = () => {
            const rand = Math.random();
            let numNotifications = 1;
            if (rand > 0.8) {
                numNotifications = Math.random() > 0.6 ? 3 : 2;
            }
            
            for(let i=0; i<numNotifications; i++){
                const staggerTimeout = setTimeout(addNotification, i * 800);
                timeouts.current.push(staggerTimeout);
            }

            const delayRange = MAX_TIME_BETWEEN_NOTIFICATIONS - MIN_TIME_BETWEEN_NOTIFICATIONS;
            const nextTime = Math.random() * delayRange + MIN_TIME_BETWEEN_NOTIFICATIONS;
            const nextTimeout = setTimeout(scheduleNext, nextTime);
            timeouts.current.push(nextTimeout);
        }

        const initialTimeout = setTimeout(scheduleNext, 5000);
        timeouts.current.push(initialTimeout);

        return () => {
            timeouts.current.forEach(clearTimeout);
        };

    }, [data, isMobile]);

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div
            aria-live="polite"
            className={cn(
                'fixed z-50 flex flex-col-reverse gap-4',
                data?.settings.position === 'bottom-left' ? 'bottom-6 left-6 items-start' : 'bottom-6 right-6 items-end'
            )}
        >
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={cn(
                        'max-w-sm rounded-xl border bg-background/80 p-4 shadow-2xl backdrop-blur-sm transition-all duration-500 ease-in-out',
                        'transform-gpu',
                        notification.isShowing
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-4 opacity-0'
                    )}
                >
                    <div className="flex items-center gap-4">
                        <Image
                            src={notification.productImage}
                            alt={notification.productName}
                            width={80}
                            height={80}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover"
                        />
                        <div className="text-sm">
                            <p className="font-semibold text-foreground">{notification.name}</p>
                            <p className="text-muted-foreground">
                                just purchased{' '}
                                <span className="font-medium text-foreground">
                                {notification.productName}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
