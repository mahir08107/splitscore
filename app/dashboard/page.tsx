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

  let currentUserId: string;

  if (isDemo) {
    currentUserId = DEMO_USER_ID;
  } else {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      redirect("/login");
    }

    currentUserId = data.user.id;
  }

  const initialData = await getDashboardData(currentUserId);
  return <DashboardClient initialData={initialData} />;
}
