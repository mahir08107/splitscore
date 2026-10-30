import React from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
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

  const initialData = await fetchGroupDetail(id, currentUserId, isDemo);

  if (!initialData) {
    notFound();
  }

  return <GroupClient initialData={initialData} isDemo={isDemo} />;
}
