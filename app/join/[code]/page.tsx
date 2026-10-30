import React from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { DEMO_GROUP, DEMO_MEMBERS_USERS, DEMO_USER_ID } from "@/lib/group/demo-data";
import { JoinGroupClient } from "./JoinGroupClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return {
    title: `Join Group (${code}) — SplitScore`,
    description: "Join an expense sharing group on SplitScore",
  };
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const uppercaseCode = code.trim().toUpperCase();

  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo_mode")?.value;
  const isDemo = Boolean(demoCookie && demoCookie.length > 0);

  let currentUserId = isDemo ? DEMO_USER_ID : "";
  let isAuthenticated = isDemo;

  if (!isDemo) {
    try {
      const serverSupabase = await createClient();
      const { data } = await serverSupabase.auth.getUser();
      if (data?.user) {
        currentUserId = data.user.id;
        isAuthenticated = true;
      }
    } catch {
      // Unconfigured or network error
    }
  }

  // Handle demo group code
  if (isDemo || uppercaseCode === "GOA2026") {
    const isAlreadyMember = Boolean(
      currentUserId && DEMO_MEMBERS_USERS.some((m) => m.id === currentUserId)
    );

    return (
      <JoinGroupClient
        inviteCode={uppercaseCode}
        groupName={DEMO_GROUP.name}
        memberCount={DEMO_MEMBERS_USERS.length}
        groupId={DEMO_GROUP.id}
        isAlreadyMember={isAlreadyMember}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId || DEMO_USER_ID}
        isDemo={isDemo}
      />
    );
  }

  if (!supabase) {
    notFound();
  }

  // Fetch MINIMAL preview data only (name, id, and member count)
  const { data: group, error: groupErr } = await supabase
    .from("groups")
    .select("id, name")
    .ilike("invite_code", uppercaseCode)
    .maybeSingle();

  if (groupErr || !group) {
    notFound();
  }

  // Fetch count of members only (never expose member identities or expenses)
  const { count: memberCount } = await supabase
    .from("group_members")
    .select("user_id", { count: "exact", head: true })
    .eq("group_id", group.id);

  // Check if current user is already member
  let isAlreadyMember = false;
  if (currentUserId) {
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", group.id)
      .eq("user_id", currentUserId)
      .maybeSingle();

    isAlreadyMember = Boolean(existingMember);
  }

  return (
    <JoinGroupClient
      inviteCode={uppercaseCode}
      groupName={group.name}
      memberCount={memberCount || 1}
      groupId={group.id}
      isAlreadyMember={isAlreadyMember}
      isAuthenticated={isAuthenticated}
      currentUserId={currentUserId}
      isDemo={isDemo}
    />
  );
}
