

import { getProducts, getAllOrders, getDeveloperSettings, getTempOtps, getUsers } from "@/lib/server/api";
import { getAllPosts } from "@/app/admin/blog/[slug]/actions";
import { DashboardClient } from "./dashboard-client";
import { OtpDashboardCard } from "./otp-dashboard-card";
import { Suspense } from 'react';

export const runtime = 'nodejs';

export default async function AdminDashboard() {
    const [products, posts, orders, devSettings, tempOtps, users] = await Promise.all([
        getProducts(),
        getAllPosts(),
        getAllOrders(),
        getDeveloperSettings(),
        getTempOtps(),
        getUsers(),
    ]);

    return (
        <div className="space-y-6">
            <Suspense fallback={<div>Loading...</div>}>
              <DashboardClient products={products} posts={posts} orders={orders} users={users} />
            </Suspense>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                 <OtpDashboardCard initialIsEnabled={devSettings?.show_otp_in_admin ?? false} initialOtps={tempOtps} />
            </div>
        </div>
    );
}
