import React from "react";
import { getDashboardData } from "@/lib/data/dashboard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard | SplitScore",
  description: "View your money balances, trust score, and pending settlements",
};

export default async function DashboardPage() {
  const initialData = await getDashboardData();
  return <DashboardClient initialData={initialData} />;
}
