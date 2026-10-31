import { supabase } from "@/lib/supabase";
import {
  GroupModel,
  GroupDetailData,
  MemberRole,
  UserSummary,
  ExpenseModel,
  SettlementModel,
  GroupMemberModel,
} from "./types";
import { computeMemberBalances, simplifyDebts } from "./balances";
import { buildDemoGroupData, DEMO_GROUP_ID, DEMO_USER_ID, DEMO_STUDENT_USER } from "./demo-data";
import { GroupType } from "@/lib/data/dashboard";

/**
 * Generates an 8-character unique uppercase invite code
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Fetches group details with all calculations for either Demo Mode or Supabase.
 */
export async function fetchGroupDetail(
  groupId: string,
  currentUserId: string = DEMO_USER_ID,
  isDemo: boolean = false
): Promise<GroupDetailData | null> {
  // 0. Only return static mock data if ID matches DEMO_GROUP_ID ('goa-trip-demo') or Supabase is not available
  if (groupId === DEMO_GROUP_ID || groupId === "goa-trip-demo" || !supabase) {
    return buildDemoGroupData();
  }

  try {
    // 1. Fetch group record with core columns
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select("id, name, type, invite_code, created_by, created_at")
      .eq("id", groupId)
      .maybeSingle();

    if (groupError || !groupData) {
      if (groupId.toLowerCase().includes("goa") || isDemo) {
        return buildDemoGroupData();
      }
      console.warn("Group not found in Supabase:", groupError?.message);
      return null;
    }

    const group: GroupModel = {
      id: groupData.id,
      name: groupData.name,
      type: (groupData.type as GroupType) || "trip",
      description: null,
      invite_code: groupData.invite_code || generateInviteCode(),
      created_by: groupData.created_by,
      owner_id: groupData.created_by,
      created_at: groupData.created_at,
      deleted_at: null,
    };

    // 2. Fetch members
    const { data: memberRows, error: memberError } = await supabase
      .from("group_members")
      .select("group_id, user_id")
      .eq("group_id", groupId);

    if (memberError) {
      console.warn("Notice fetching group members:", memberError.message);
    }

    const memberList = memberRows || [];
    let memberUserIds = Array.from(new Set(memberList.map((m: { user_id: string }) => m.user_id)));

    // Ensure creator and current user are in member list
    if (group.created_by && !memberUserIds.includes(group.created_by)) {
      memberUserIds.push(group.created_by);
    }
    if (currentUserId && !memberUserIds.includes(currentUserId)) {
      memberUserIds.push(currentUserId);
    }

    // Fetch user profiles for these members
    let userProfilesMap: Record<string, UserSummary> = {};
    if (memberUserIds.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("id, name, email, avatar")
        .in("id", memberUserIds);

      for (const u of usersData || []) {
        userProfilesMap[u.id] = {
          id: u.id,
          name: u.name || (u.id === currentUserId ? "Aarav Sharma" : "Member"),
          email: u.email || "",
          avatar: u.avatar || null,
        };
      }
    }

    // 3. Fetch expenses with splits
    const { data: expensesData, error: expError } = await supabase
      .from("expenses")
      .select("id, group_id, title, amount, paid_by, category, date")
      .eq("group_id", groupId)
      .order("date", { ascending: false });

    if (expError) {
      console.warn("Notice fetching expenses:", expError.message);
    }

    // If Goa Trip in demo mode has no expenses in DB, load rich demo expenses
    if (
      isDemo &&
      group.name.toLowerCase().trim() === "goa trip" &&
      (!expensesData || expensesData.length === 0)
    ) {
      return buildDemoGroupData();
    }

    const expenseIds = (expensesData || []).map((e: { id: string }) => e.id);
    let splitsByExpense: Record<string, Array<{ expense_id: string; user_id: string; share_amount: number }>> = {};

    if (expenseIds.length > 0) {
      const { data: splitsData } = await supabase
        .from("expense_splits")
        .select("expense_id, user_id, share_amount")
        .in("expense_id", expenseIds);

      for (const s of splitsData || []) {
        if (!splitsByExpense[s.expense_id]) splitsByExpense[s.expense_id] = [];
        splitsByExpense[s.expense_id].push(s);
      }
    }

    const expenses: ExpenseModel[] = (expensesData || []).map((e: any) => ({
      id: e.id,
      group_id: e.group_id,
      title: e.title,
      amount: Number(e.amount) || 0,
      paid_by: e.paid_by,
      category: e.category || "General",
      date: e.date,
      split_type: e.split_type || "equal",
      payerName: userProfilesMap[e.paid_by]?.name || (e.paid_by === currentUserId ? "Aarav Sharma" : "Member"),
      splits: (splitsByExpense[e.id] || []).map((s) => ({
        expense_id: s.expense_id,
        user_id: s.user_id,
        share_amount: Number(s.share_amount) || 0,
        userName: userProfilesMap[s.user_id]?.name || (s.user_id === currentUserId ? "Aarav Sharma" : "Member"),
      })),
    }));

    // 4. Fetch settlements
    const { data: settlementsData, error: setError } = await supabase
      .from("settlements")
      .select("id, group_id, from_user, to_user, amount, status")
      .eq("group_id", groupId);

    if (setError) {
      console.warn("Notice fetching settlements:", setError.message);
    }

    const settlementsList: SettlementModel[] = (settlementsData || []).map((s: any) => ({
      id: s.id,
      group_id: s.group_id,
      from_user: s.from_user,
      to_user: s.to_user,
      amount: Number(s.amount) || 0,
      due_date: s.due_date || null,
      status: s.status,
      marked_paid_at: s.marked_paid_at || null,
      confirmed_at: s.confirmed_at || null,
      fromName: userProfilesMap[s.from_user]?.name || "Member",
      toName: userProfilesMap[s.to_user]?.name || "Member",
    }));

    const awaitingSettlements = settlementsList.filter(
      (s) => s.status === "marked_paid" || s.status === "pending"
    );

    // 5. Calculations
    const netBalances = computeMemberBalances(memberUserIds, expenses, settlementsList);

    // Contributed amounts
    const totalContributedMap: Record<string, number> = {};
    for (const uid of memberUserIds) {
      totalContributedMap[uid] = 0;
    }
    for (const e of expenses) {
      if (totalContributedMap[e.paid_by] !== undefined) {
        totalContributedMap[e.paid_by] += Number(e.amount) || 0;
      }
    }

    const memberNamesMap: Record<string, string> = {};
    for (const uid of memberUserIds) {
      memberNamesMap[uid] = userProfilesMap[uid]?.name || "Member";
    }

    const members: GroupMemberModel[] = memberList.map((m: any) => {
      const isOwner = group.owner_id === m.user_id;
      const role: MemberRole = m.role === "admin" || isOwner ? "admin" : "member";
      return {
        group_id: groupId,
        user_id: m.user_id,
        role,
        status: m.status || "active",
        left_at: m.left_at || null,
        removed_by: m.removed_by || null,
        isOwner,
        joined_at: m.joined_at,
        user: userProfilesMap[m.user_id] || {
          id: m.user_id,
          name: "Member",
          email: "",
          avatar: null,
        },
        totalContributed: totalContributedMap[m.user_id] || 0,
        netBalance: netBalances[m.user_id] || 0,
      };
    });

    // Debt Simplification
    const suggestedSettlements = simplifyDebts(netBalances, memberNamesMap);

    // Current user role
    const currentMemberRecord = members.find((m) => m.user_id === currentUserId);
    const currentUserRole: MemberRole =
      currentMemberRecord?.role || (group.created_by === currentUserId ? "admin" : "member");

    // Metrics
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const myNet = netBalances[currentUserId] || 0;
    const youOwe = myNet < 0 ? Math.abs(myNet) : 0;
    const youAreOwed = myNet > 0 ? myNet : 0;

    const currentUser: UserSummary = userProfilesMap[currentUserId] || {
      id: currentUserId,
      name: "You",
      email: "",
      avatar: null,
    };

    return {
      group,
      members,
      expenses,
      awaitingSettlements,
      suggestedSettlements,
      summary: {
        totalExpenses,
        youOwe,
        youAreOwed,
        memberCount: members.length,
      },
      currentUser,
      currentUserRole,
    };
  } catch (err) {
    console.error("fetchGroupDetail error, falling back to demo:", err);
    return buildDemoGroupData();
  }
}

/**
 * Creates a new group and automatically adds the creator as admin.
 */
export async function createGroup(
  input: { name: string; type: GroupType; description?: string },
  creatorId: string = DEMO_USER_ID,
  isDemo: boolean = false
): Promise<{ success: boolean; group?: GroupModel; error?: string }> {
  if (!input.name || input.name.trim().length === 0) {
    return { success: false, error: "Group name is required." };
  }

  const inviteCode = generateInviteCode();

  if (isDemo || !supabase) {
    const mockGroup: GroupModel = {
      id: `group-${Date.now()}`,
      name: input.name.trim(),
      type: input.type,
      description: input.description?.trim() || null,
      invite_code: inviteCode,
      created_by: creatorId,
      created_at: new Date().toISOString(),
    };
    return { success: true, group: mockGroup };
  }

  try {
    // Insert group
    const { data: newGroup, error: groupErr } = await supabase
      .from("groups")
      .insert({
        name: input.name.trim(),
        type: input.type,
        invite_code: inviteCode,
        created_by: creatorId,
      })
      .select()
      .single();

    if (groupErr || !newGroup) {
      return { success: false, error: groupErr?.message || "Failed to create group." };
    }

    // Insert creator into group_members as admin
    const { error: memberErr } = await supabase.from("group_members").insert({
      group_id: newGroup.id,
      user_id: creatorId,
      role: "admin",
    });

    if (memberErr) {
      console.warn("Failed setting admin role for creator:", memberErr.message);
    }

    return { success: true, group: newGroup };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred." };
  }
}

/**
 * Joins a group by unique invite code with duplicate membership protection.
 */
export async function joinGroupByCode(
  inviteCode: string,
  userId: string = DEMO_USER_ID,
  isDemo: boolean = false
): Promise<{ success: boolean; groupId?: string; groupName?: string; error?: string }> {
  const code = inviteCode.trim().toUpperCase();

  if (isDemo || !supabase) {
    if (code === "GOA2026") {
      return { success: true, groupId: DEMO_GROUP_ID, groupName: "Goa Trip" };
    }
    return { success: true, groupId: `group-${Date.now()}`, groupName: "Demo Group" };
  }

  try {
    // 1. Locate group by invite_code (must not be deleted)
    const { data: group, error: groupErr } = await supabase
      .from("groups")
      .select("id, name, deleted_at")
      .ilike("invite_code", code)
      .maybeSingle();

    if (groupErr || !group || group.deleted_at) {
      return { success: false, error: "Invalid invite code or group does not exist." };
    }

    // 2. Check member status
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("user_id, status")
      .eq("group_id", group.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMember) {
      if (existingMember.status === "removed") {
        return {
          success: false,
          error: "You have been removed from this group by the owner and cannot rejoin by invite link.",
        };
      }
      if (existingMember.status === "active") {
        return {
          success: true,
          groupId: group.id,
          groupName: group.name,
        };
      }
      if (existingMember.status === "left") {
        // Reactivate member who had left
        await supabase
          .from("group_members")
          .update({ status: "active", left_at: null })
          .eq("group_id", group.id)
          .eq("user_id", userId);

        return {
          success: true,
          groupId: group.id,
          groupName: group.name,
        };
      }
    }

    // 3. Add to group as new active member
    const { error: insertErr } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: userId,
      role: "member",
      status: "active",
    });

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    return {
      success: true,
      groupId: group.id,
      groupName: group.name,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to join group." };
  }
}

/**
 * Updates group settings (name, type, description)
 */
export async function updateGroupSettings(
  groupId: string,
  updates: { name?: string; type?: GroupType; description?: string },
  isDemo: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (isDemo || !supabase) {
    return { success: true };
  }

  try {
    // Strip description since the column doesn't exist in the DB schema
    const { description, ...safeUpdates } = updates as any;
    const { error } = await supabase
      .from("groups")
      .update(safeUpdates)
      .eq("id", groupId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Regenerates invite code for group
 */
export async function regenerateGroupInviteCode(
  groupId: string,
  isDemo: boolean = false
): Promise<{ success: boolean; newCode?: string; error?: string }> {
  const newCode = generateInviteCode();
  if (isDemo || !supabase) {
    return { success: true, newCode };
  }

  try {
    const { error } = await supabase
      .from("groups")
      .update({ invite_code: newCode })
      .eq("id", groupId);

    if (error) return { success: false, error: error.message };
    return { success: true, newCode };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Updates member role (admin/member)
 */
export async function updateMemberRole(
  groupId: string,
  userId: string,
  newRole: MemberRole,
  isDemo: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (isDemo || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from("group_members")
      .update({ role: newRole })
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Removes a member from group (guarded against removing last admin)
 */
export async function removeMemberFromGroup(
  groupId: string,
  userId: string,
  isDemo: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (isDemo || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes a group
 */
export async function deleteGroup(
  groupId: string,
  isDemo: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (isDemo || !supabase) {
    return { success: true };
  }

  try {
    // Delete group (cascade handles members/expenses or manual cleanup)
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

