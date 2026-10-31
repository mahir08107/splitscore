import React from "react";
import { redirect } from "next/navigation";
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
  const isDemo = cookieStore.get("demo_mode")?.value === "true";

  let currentUserId: string | null = null;

  // Always try to get the real auth user first (demo mode now signs in as a real user)
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      currentUserId = data.user.id;
    }
  } catch {
    // Supabase credentials may be unconfigured in dev
  }

  // If still no user and not demo mode, redirect to login
  if (!currentUserId) {
    if (isDemo) {
      // Fallback for demo mode when auth failed
      currentUserId = DEMO_USER_ID;
    } else {
      redirect("/login");
    }
  }

  const isDemoEffective = isDemo || currentUserId === DEMO_USER_ID;
  const initialData = await getDashboardData(currentUserId, isDemoEffective);
  return <DashboardClient initialData={initialData} />;
}
