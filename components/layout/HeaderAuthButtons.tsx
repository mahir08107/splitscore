"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/SignOutButton";

export function HeaderAuthButtons() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    // Check demo cookie
    const hasDemo = document.cookie.includes("demo_mode=true");
    setIsDemo(hasDemo);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setIsAuthenticated(true);
      }
      setChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
      const demoActive = document.cookie.includes("demo_mode=true");
      setIsDemo(demoActive);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!checked) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-[#4338CA] hover:bg-[#2E2A7A] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
      >
        Sign In
      </Link>
    );
  }

  if (isAuthenticated || isDemo) {
    return <SignOutButton isDemo={isDemo && !isAuthenticated} />;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/signup"
        className="hidden md:inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-sm font-medium text-[#4338CA] hover:bg-[#F1F1FA] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
      >
        Sign Up
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-[#4338CA] hover:bg-[#2E2A7A] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
      >
        Sign In
      </Link>
    </div>
  );
}
