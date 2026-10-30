import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface JoinGroupPageProps {
  params: Promise<{ invite_code: string }>;
}

export default async function JoinGroupPage({ params }: JoinGroupPageProps) {
  const { invite_code } = await params;
  const supabase = await createClient();

  // 1. Check if user is authenticated
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    // Redirect to login with a return path
    redirect(`/login?next=/group/join/${invite_code}`);
  }

  // 2. Look up the group by invite_code
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name")
    .eq("invite_code", invite_code)
    .maybeSingle();

  if (groupError || !group) {
    // Invalid invite code, redirect to dashboard with error context
    redirect("/dashboard");
  }

  // 3. Check if user is already a member
  const { data: existingMember } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    // Already a member, go straight to the group page
    redirect(`/group/${group.id}`);
  }

  // 4. Insert user into group_members
  const { error: insertError } = await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      user_id: user.id,
    });

  if (insertError) {
    console.error("Failed to join group:", insertError.message);
    redirect("/dashboard");
  }

  // 5. Redirect to the group page
  redirect(`/group/${group.id}`);
}
