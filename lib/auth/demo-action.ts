"use server";

import { createClient } from "@/lib/supabase/server";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
  type SignInDemoResult,
} from "@/lib/auth/demo-constants";

/**
 * Server Action: Signs in as the real demo user (Aarav) using supabase.auth.signInWithPassword
 * so that auth.uid() is populated, session cookies are set, and real RLS policies apply.
 */
export async function signInAsDemoUserAction(): Promise<SignInDemoResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
    });

    if (error) {
      console.error("[signInAsDemoUserAction] Error:", error.message);
      return {
        success: false,
        error:
          "Could not sign in as demo user. If you haven't yet, please run the SQL migration in the Supabase SQL editor: " +
          error.message,
      };
    }

    if (!data.session) {
      return {
        success: false,
        error: "No active session returned for demo user.",
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[signInAsDemoUserAction] Exception:", err);
    return {
      success: false,
      error: err?.message || "Failed to sign in as demo user.",
    };
  }
}
