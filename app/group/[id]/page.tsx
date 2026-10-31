import React from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { fetchGroupDetail } from "@/lib/group/service";
import { GroupClient } from "@/components/group/GroupClient";
import { DEMO_USER_ID } from "@/lib/group/demo-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Group | SplitScore`,
    description: "Manage group expenses, balances and members on SplitScore",
  };
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo_mode")?.value;
  const isDemo = Boolean(demoCookie && demoCookie.length > 0);

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

  // Fallback for demo mode
  if (!currentUserId && isDemo) {
    currentUserId = DEMO_USER_ID;
  }

  // If still no user and not demo, redirect to login
  if (!currentUserId) {
    redirect("/login");
  }

  const isDemoEffective = isDemo || currentUserId === DEMO_USER_ID;

  // currentUserId is guaranteed non-null here (redirect is a never-returning function)
  const initialData = await fetchGroupDetail(id, currentUserId, isDemoEffective);

  if (!initialData) {
    notFound();
  }

  return <GroupClient initialData={initialData} isDemo={isDemoEffective} />;
}
