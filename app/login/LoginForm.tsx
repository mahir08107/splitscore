"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for error from redirect or search params
  const errorParam = searchParams.get("error");
  const displayError =
    errorMessage ||
    (errorParam === "auth_failed"
      ? "Authentication failed. Please try again."
      : errorParam
        ? decodeURIComponent(errorParam)
        : null);

  const nextUrl = searchParams.get("next") || "/dashboard";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate empty fields
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const lower = error.message.toLowerCase();
        if (
          lower.includes("invalid login credentials") ||
          lower.includes("invalid_credentials") ||
          lower.includes("invalid grant")
        ) {
          setErrorMessage("Incorrect email or password. Please check your credentials and try again.");
        } else if (lower.includes("email not confirmed")) {
          setErrorMessage("Your email address has not been confirmed yet. Please check your inbox for the verification link.");
        } else if (
          lower.includes("fetch failed") ||
          lower.includes("network") ||
          lower.includes("failed to fetch")
        ) {
          setErrorMessage("Network error: Unable to connect to the authentication service. Please check your connection.");
        } else {
          setErrorMessage(error.message || "Failed to sign in. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (data?.session) {
        // Clear any demo cookie so real session takes full priority
        document.cookie =
          "demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax";
        router.push(nextUrl);
        router.refresh();
      } else {
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
        setErrorMessage("Network error: Unable to connect to the authentication server. Please check your internet connection.");
      } else {
        setErrorMessage("An unexpected error occurred during sign in. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleTryDemo = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setLoadingDemo(true);

    try {
      const { signInAsDemoUserAction } = await import("@/lib/auth/demo-action");
      const res = await signInAsDemoUserAction();

      if (!res.success) {
        setErrorMessage(res.error || "Failed to sign in as demo user.");
        setLoadingDemo(false);
        return;
      }

      document.cookie = "demo_mode=true; path=/; max-age=86400; SameSite=Lax";
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to start demo mode.");
      setLoadingDemo(false);
    }
  };

  const isSubmitting = loading || loadingDemo;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5EF] p-6 sm:p-8 shadow-sm sm:shadow-md">
      {/* Brand & Tagline */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2E2A7A] text-white font-bold text-xl mb-4 shadow-sm">
          S
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2E2A7A]">
          SplitScore
        </h1>
        <p className="text-sm text-[#5B5B72] mt-1">
          Split fair. Score fair.
        </p>
      </div>

      {/* Error Alert */}
      {displayError && (
        <div
          role="alert"
          className="mb-5 p-3.5 bg-red-50 border border-[#B91C1C]/20 rounded-xl text-xs sm:text-sm text-[#B91C1C] flex items-start gap-2.5"
        >
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 font-medium">{displayError}</div>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-[#1F1D3D] mb-1.5">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            disabled={isSubmitting}
            className="w-full h-11 px-3.5 rounded-xl border border-[#D1D1DF] bg-white text-sm text-[#1F1D3D] placeholder:text-[#9B9BAF] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent disabled:opacity-60 transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-semibold text-[#1F1D3D] mb-1.5">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            disabled={isSubmitting}
            className="w-full h-11 px-3.5 rounded-xl border border-[#D1D1DF] bg-white text-sm text-[#1F1D3D] placeholder:text-[#9B9BAF] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent disabled:opacity-60 transition-shadow"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#2E2A7A] hover:bg-[#23205E] text-white font-semibold text-sm sm:text-base flex items-center justify-center transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative py-4 flex items-center justify-center">
        <div className="w-full border-t border-[#E5E5EF]"></div>
        <span className="absolute bg-white px-3 text-[11px] uppercase tracking-wider text-[#7E7E94]">
          or preview demo
        </span>
      </div>

      {/* Try Demo Button */}
      <button
        type="button"
        onClick={handleTryDemo}
        disabled={isSubmitting}
        className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#F1F1FA] hover:bg-[#E5E5F5] text-[#2E2A7A] font-semibold text-sm sm:text-base border border-[#E0E0F0] flex items-center justify-center transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
      >
        {loadingDemo ? "Entering Demo..." : "Try Demo"}
      </button>

      {/* Footer links */}
      <p className="text-center text-sm text-[#5B5B72] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#4338CA] hover:text-[#2E2A7A] transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
