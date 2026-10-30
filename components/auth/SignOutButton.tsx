"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  isDemo?: boolean;
}

export function SignOutButton({ isDemo = false }: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      // 1. Clear demo_mode cookie with matching path
      document.cookie =
        "demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax";

      // 2. Call Supabase sign out
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (authErr) {
        console.warn("Supabase auth signOut error (can be ignored in demo):", authErr);
      }
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      // 3. Ensure cookie is gone and redirect to landing page
      document.cookie =
        "demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax";
      window.location.href = "/";
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      title={isDemo ? "Exit Demo and return to home" : "Log out of SplitScore"}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5B5B72] hover:text-[#B91C1C] hover:bg-red-50 rounded-lg transition-colors min-h-[38px] border border-[#E5E5F0] hover:border-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] disabled:opacity-60"
      aria-label={isDemo ? "Exit Demo" : "Log out"}
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{loading ? "Logging out..." : isDemo ? "Exit Demo" : "Log out"}</span>
    </button>
  );
}
