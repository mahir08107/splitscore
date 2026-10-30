import React from "react";
import { cookies } from "next/headers";
import { getDashboardData, DEMO_USER_ID } from "@/lib/data/dashboard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard | SplitScore",
  description: "View your money balances, trust score, and pending settlements",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo_mode")?.value;
  const isDemo = Boolean(demoCookie && demoCookie.length > 0);

  let currentUserId = DEMO_USER_ID;

  if (!isDemo) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        currentUserId = data.user.id;
      }
    } catch {
      // Supabase credentials may be unconfigured in dev
    }
  }

  const initialData = await getDashboardData(currentUserId);
  return <DashboardClient initialData={initialData} />;
}

