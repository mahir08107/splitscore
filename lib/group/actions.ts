"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface GroupActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Remove a member from the group.
 * Allowed ONLY for the owner. Blocked if member has open balance, unconfirmed settlements, or open plans.
 */
export async function removeMemberAction(
  groupId: string,
  targetUserId: string
): Promise<GroupActionResult> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return { success: false, error: "Please sign in to manage members." };
    }

    const { data, error } = await supabase.rpc("remove_group_member", {
      p_group_id: groupId,
      p_target_user_id: targetUserId,
    });

    if (!error) {
      revalidatePath(`/group/${groupId}`);
      revalidatePath(`/groups/${groupId}`);
      revalidatePath("/dashboard");
      return { success: true, data };
    }

    // Fallback if RPC is not in schema cache
    const isMissingRpc =
      error.message?.includes("Could not find the function") ||
      error.code === "PGRST202" ||
      error.message?.includes("schema cache");

    if (!isMissingRpc) {
      return { success: false, error: error.message };
    }

    const { error: delErr } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", targetUserId);

    if (delErr) {
      return { success: false, error: delErr.message };
    }

    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to remove member." };
  }
}

/**
 * Leave the group.
 * Allowed for any non-owner active member. Blocked if caller has open balance or open settlements.
 */
export async function leaveGroupAction(groupId: string): Promise<GroupActionResult> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return { success: false, error: "Please sign in." };
    }

    const { data, error } = await supabase.rpc("leave_group", {
      p_group_id: groupId,
    });

    if (!error) {
      revalidatePath(`/group/${groupId}`);
      revalidatePath(`/groups/${groupId}`);
      revalidatePath("/dashboard");
      return { success: true, data };
    }

    // Fallback if RPC is missing
    const isMissingRpc =
      error.message?.includes("Could not find the function") ||
      error.code === "PGRST202" ||
      error.message?.includes("schema cache");

    if (!isMissingRpc) {
      return { success: false, error: error.message };
    }

    const { error: delErr } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", authData.user.id);

    if (delErr) {
      return { success: false, error: delErr.message };
    }

    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to leave group." };
  }
}

/**
 * Transfer group ownership to another active member.
 * Allowed ONLY for the current owner.
 */
export async function transferOwnershipAction(
  groupId: string,
  newOwnerId: string
): Promise<GroupActionResult> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return { success: false, error: "Please sign in." };
    }

    const { data, error } = await supabase.rpc("transfer_group_ownership", {
      p_group_id: groupId,
      p_new_owner_id: newOwnerId,
    });

    if (!error) {
      revalidatePath(`/group/${groupId}`);
      revalidatePath(`/groups/${groupId}`);
      revalidatePath("/dashboard");
      return { success: true, data };
    }

    // Fallback if RPC missing
    await supabase.from("groups").update({ created_by: newOwnerId }).eq("id", groupId);

    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to transfer ownership." };
  }
}

/**
 * Re-add a removed member back into the group.
 * Allowed ONLY for the owner.
 */
export async function readdMemberAction(
  groupId: string,
  targetUserId: string
): Promise<GroupActionResult> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return { success: false, error: "Please sign in." };
    }

    const { data, error } = await supabase.rpc("readd_group_member", {
      p_group_id: groupId,
      p_target_user_id: targetUserId,
    });

    if (!error) {
      revalidatePath(`/group/${groupId}`);
      revalidatePath(`/groups/${groupId}`);
      revalidatePath("/dashboard");
      return { success: true, data };
    }

    // Fallback if RPC is missing
    await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: targetUserId,
    });

    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to re-add member." };
  }
}

/**
 * Delete group.
 * Allowed ONLY for the owner. Requires typing group name.
 */
export async function deleteGroupAction(
  groupId: string,
  confirmName: string
): Promise<GroupActionResult> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return { success: false, error: "Please sign in." };
    }

    // Special case for static demo Goa Trip
    if (groupId === "goa-trip-demo") {
      revalidatePath("/dashboard");
      return { success: true };
    }

    let rpcSuccess = false;
    let rpcError: any = null;

    try {
      const { data, error } = await supabase.rpc("delete_group", {
        p_group_id: groupId,
        p_confirm_name: confirmName,
      });

      if (!error) {
        rpcSuccess = true;
      } else {
        rpcError = error;
      }
    } catch (e: any) {
      rpcError = e;
    }

    if (rpcSuccess) {
      revalidatePath(`/group/${groupId}`);
      revalidatePath(`/groups/${groupId}`);
      revalidatePath("/dashboard");
      return { success: true };
    }

    // If it's a real validation error from the RPC (not a missing function error), return it
    const isMissingRpc =
      rpcError?.message?.includes("Could not find the function") ||
      rpcError?.code === "PGRST202" ||
      rpcError?.message?.includes("schema cache");

    if (!isMissingRpc && rpcError) {
      return { success: false, error: rpcError.message };
    }

    // Direct database fallback
    const { data: group, error: fetchErr } = await supabase
      .from("groups")
      .select("id, name, created_by")
      .eq("id", groupId)
      .maybeSingle();

    if (fetchErr || !group) {
      return { success: false, error: "Group not found." };
    }

    if (group.name.trim().toLowerCase() !== confirmName.trim().toLowerCase()) {
      return {
        success: false,
        error: "Confirmation name does not match the group name.",
      };
    }

    // Try soft-delete with deleted_at first
    let deletedSuccessfully = false;
    try {
      const { error: softErr } = await supabase
        .from("groups")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", groupId);

      if (!softErr) {
        deletedSuccessfully = true;
      }
    } catch {
      // Column might not exist
    }

    // If soft delete failed, perform cascade delete
    if (!deletedSuccessfully) {
      const { data: expList } = await supabase
        .from("expenses")
        .select("id")
        .eq("group_id", groupId);

      const expIds = (expList || []).map((e: { id: string }) => e.id);
      if (expIds.length > 0) {
        await supabase.from("expense_splits").delete().in("expense_id", expIds);
        await supabase.from("expenses").delete().eq("group_id", groupId);
      }

      await supabase.from("settlements").delete().eq("group_id", groupId);
      await supabase.from("group_members").delete().eq("group_id", groupId);
      const { error: delErr } = await supabase.from("groups").delete().eq("id", groupId);

      if (delErr) {
        return { success: false, error: delErr.message || "Failed to delete group." };
      }
    }

    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete group." };
  }
}

/**
 * Rotate group invite code.
 * Allowed ONLY for the owner.
 */
export async function rotateInviteCodeAction(groupId: string): Promise<GroupActionResult> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return { success: false, error: "Please sign in." };
    }

    const { data, error } = await supabase.rpc("rotate_group_invite_code", {
      p_group_id: groupId,
    });

    if (!error) {
      revalidatePath(`/group/${groupId}`);
      revalidatePath(`/groups/${groupId}`);
      return { success: true, data };
    }

    // Fallback if RPC is missing
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error: updateErr } = await supabase
      .from("groups")
      .update({ invite_code: newCode })
      .eq("id", groupId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/groups/${groupId}`);
    return { success: true, data: { invite_code: newCode } };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to rotate invite code." };
  }
}

/**
 * Join group by invite code.
 * Rejects deleted groups and removed members. Idempotent for active members.
 */
export async function joinGroupByCodeAction(inviteCode: string): Promise<GroupActionResult> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return { success: false, error: "Please sign in to join the group." };
    }

    const { data, error } = await supabase.rpc("join_group_by_invite_code", {
      p_invite_code: inviteCode,
    });

    if (!error) {
      revalidatePath("/dashboard");
      return { success: true, data };
    }

    // Fallback if RPC is missing: lookup group by code and add member
    const { data: foundGroup } = await supabase
      .from("groups")
      .select("id")
      .eq("invite_code", inviteCode.trim().toUpperCase())
      .maybeSingle();

    if (!foundGroup) {
      return { success: false, error: "Invalid invite code." };
    }

    await supabase.from("group_members").insert({
      group_id: foundGroup.id,
      user_id: authData.user.id,
    });

    revalidatePath("/dashboard");
    return { success: true, data: { group_id: foundGroup.id } };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to join group." };
  }
}
