

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardData {
    title: string;
    value: number | string;
    subtitle: string;
    icon: LucideIcon;
    color: string;
    href: string;
}

export function DashboardStatCard({ title, value, subtitle, icon: Icon, color, href }: StatCardData) {
    const isClickable = href && href !== "#";

    const content = (
        <Card className={cn("relative overflow-hidden", color)}>
            <div className="absolute -bottom-4 -right-4 opacity-20">
                <Icon className="h-24 w-24" strokeWidth={1.5} />
            </div>
            <CardContent className="pt-6">
                <div className="text-4xl font-bold">{value}</div>
                <div className="text-lg font-semibold mt-1">{title}</div>
                <p className="text-sm opacity-80">{subtitle}</p>
            </CardContent>
        </Card>
    );

    if (isClickable) {
        return (
            <Link href={href} className="hover:scale-105 transition-transform duration-200 block">
                {content}
            </Link>
        )
    }

    return content;
}
