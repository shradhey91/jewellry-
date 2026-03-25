"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DashboardStatCard,
  type StatCardData,
} from "@/app/admin/dashboard-stat-card";
import {
  Users,
  Package,
  Newspaper,
  AlertTriangle,
  UserPlus,
  Trash2,
  TrendingUp,
  Palette,
  XCircle,
  Loader2,
} from "lucide-react";
import { clearCacheAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Product, Order, User } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function PermissionError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const page = searchParams.get("page");

  if (error === "permission_denied") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have the required permissions to access the{" "}
          <strong>{page || "previous"}</strong> page.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="secondary" className="mt-4" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Clearing...
        </>
      ) : (
        "Clear Now"
      )}
    </Button>
  );
}

function ClearCacheCard() {
  const [state, formAction] = useFormState(clearCacheAction, {
    success: false,
    message: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <Card
        className={cn(
          "relative overflow-hidden group transition-all duration-300 hover:shadow-xl",
          "bg-foreground text-background",
        )}
      >
        <div className="absolute -bottom-6 -right-6 opacity-20 group-hover:opacity-30 group-hover:scale-125 transition-transform duration-300">
          <Trash2 className="h-28 w-28" strokeWidth={1} />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-6 w-6" />
            <span>Clear Cache</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm opacity-80 mt-1">
            Force-refresh all site data.
          </p>
          <SubmitButton />
        </CardContent>
      </Card>
    </form>
  );
}

export function DashboardClient({
  products,
  posts,
  orders,
  users,
}: {
  products: Product[];
  posts: any[];
  orders: Order[];
  users: User[];
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysSales = orders
    .filter((o) => new Date(o.created_at) >= today && o.status !== "cancelled")
    .reduce((sum, order) => {
      const orderTotal = order.items.reduce(
        (itemSum, item) => itemSum + item.price_snapshot.total * item.quantity,
        0,
      );
      const discount = order.discount?.amount || 0;
      return sum + (orderTotal - discount);
    }, 0);

  const totalSignups = users.filter((u) => u.role === "customer").length;

  const newSignupsToday = users.filter(
    (u) =>
      u.role === "customer" && u.created_at && new Date(u.created_at) >= today,
  ).length;

  const pendingOrders = orders.filter((o) => o.status === "processing").length;
  const todayCancellations = orders.filter(
    (o) => o.status === "cancelled" && new Date(o.created_at) >= today,
  ).length;

  const stats: StatCardData[] = [
    {
      title: "Today's Sales",
      value: `₹${Math.round(todaysSales).toLocaleString("en-IN")}`,
      subtitle: "Revenue from sales today",
      icon: TrendingUp,
      color: "bg-primary text-primary-foreground",
      href: "/admin/report",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      subtitle: "Ready to be processed",
      icon: AlertTriangle,
      color: "bg-foreground text-background",
      href: "/admin/orders",
    },
    {
      title: "Today's Cancellations",
      value: todayCancellations,
      subtitle: "Orders cancelled today",
      icon: XCircle,
      color: "bg-destructive text-destructive-foreground",
      href: "/admin/orders",
    },
    {
      title: "New Signups (Today)",
      value: newSignupsToday,
      subtitle: "New customers so far today",
      icon: UserPlus,
      color: "bg-secondary text-secondary-foreground",
      href: "/admin/customers",
    },
    {
      title: "Total Signups",
      value: totalSignups,
      subtitle: "Total customer accounts",
      icon: Users,
      color: "bg-card text-card-foreground",
      href: "/admin/customers",
    },
    {
      title: "Total Products",
      value: products.length,
      subtitle: "Manage Products",
      icon: Package,
      color: "bg-card text-card-foreground",
      href: "/admin/products",
    },
  ];

  const utilityCards: StatCardData[] = [
    {
      title: "Appearance",
      value: "Edit",
      subtitle: "Customize homepage",
      icon: Palette,
      color: "bg-accent text-accent-foreground",
      href: "/admin/appearance",
    },
    {
      title: "Total Posts",
      value: posts.length,
      subtitle: "Manage Posts",
      icon: Newspaper,
      color: "bg-accent text-accent-foreground",
      href: "/admin/blog",
    },
  ];

  return (
    <div>
      <PermissionError />
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Dashboard
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <DashboardStatCard key={stat.title} {...stat} />
        ))}
        {utilityCards.map((stat) => (
          <DashboardStatCard key={stat.title} {...stat} />
        ))}
        <ClearCacheCard />
      </div>
    </div>
  );
}
