"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Check for empty fields
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    // 2. Check password length (at least 8 characters)
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    // 3. Check password match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Sign up via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        const lower = error.message.toLowerCase();
        if (
          lower.includes("already registered") ||
          lower.includes("user already exists") ||
          lower.includes("identity already exists") ||
          error.status === 422
        ) {
          setErrorMessage("An account with this email already exists. Please log in instead.");
        } else if (lower.includes("valid email")) {
          setErrorMessage("Please enter a valid email address.");
        } else if (
          lower.includes("fetch failed") ||
          lower.includes("network") ||
          lower.includes("failed to fetch")
        ) {
          setErrorMessage("Network error: Unable to connect to authentication service. Please check your internet connection.");
        } else {
          setErrorMessage(error.message || "Failed to create account. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Check if user was created
      if (data?.user) {
        // Create matching row in public.users table if trigger did not already insert it
        try {
          await supabase.from("users").upsert(
            {
              id: data.user.id,
              name: name.trim() || "New User",
              email: email.trim(),
            },
            { onConflict: "id" }
          );
        } catch (dbErr) {
          console.warn("Direct insert into public.users skipped or handled by trigger:", dbErr);
        }

        // Clear any demo cookie so the user's authenticated session takes effect
        document.cookie =
          "demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax";

        // If session was returned immediately (auto-confirm enabled in Supabase)
        if (data.session) {
          setSuccessMessage("Account created successfully! Redirecting to your dashboard...");
          router.push("/dashboard");
          router.refresh();
        } else {
          // If email verification is enabled on Supabase
          setSuccessMessage(
            "Account created! Please check your email inbox to verify your account, or sign in if email confirmation is disabled."
          );
          setLoading(false);
        }
      } else {
        setErrorMessage("Signup could not be completed. Please try again.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
        setErrorMessage("Network error: Unable to connect to authentication service. Please check your connection.");
      } else {
        setErrorMessage("An unexpected error occurred during signup. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5EF] p-6 sm:p-8 shadow-sm sm:shadow-md">
      {/* Brand & Tagline */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2E2A7A] text-white font-bold text-xl mb-4 shadow-sm">
          S
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2E2A7A]">
          Create Account
        </h1>
        <p className="text-sm text-[#5B5B72] mt-1">
          Split fair. Score fair.
        </p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div
          role="status"
          className="mb-5 p-4 bg-emerald-50 border border-emerald-500/20 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-start gap-2.5"
        >
          <svg className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3.5 bg-red-50 border border-[#B91C1C]/20 rounded-xl text-xs sm:text-sm text-[#B91C1C] flex items-start gap-2.5"
        >
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className="block text-xs font-semibold text-[#1F1D3D] mb-1.5">
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            disabled={loading}
            className="w-full h-11 px-3.5 rounded-xl border border-[#D1D1DF] bg-white text-sm text-[#1F1D3D] placeholder:text-[#9B9BAF] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent disabled:opacity-60 transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-xs font-semibold text-[#1F1D3D] mb-1.5">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            disabled={loading}
            className="w-full h-11 px-3.5 rounded-xl border border-[#D1D1DF] bg-white text-sm text-[#1F1D3D] placeholder:text-[#9B9BAF] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent disabled:opacity-60 transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-xs font-semibold text-[#1F1D3D] mb-1.5">
            Password (min 8 characters)
          </label>
          <input
            id="signup-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            disabled={loading}
            className="w-full h-11 px-3.5 rounded-xl border border-[#D1D1DF] bg-white text-sm text-[#1F1D3D] placeholder:text-[#9B9BAF] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent disabled:opacity-60 transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-[#1F1D3D] mb-1.5">
            Confirm Password
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            disabled={loading}
            className="w-full h-11 px-3.5 rounded-xl border border-[#D1D1DF] bg-white text-sm text-[#1F1D3D] placeholder:text-[#9B9BAF] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent disabled:opacity-60 transition-shadow"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#2E2A7A] hover:bg-[#23205E] text-white font-semibold text-sm sm:text-base flex items-center justify-center transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Footer link to Login */}
      <p className="text-center text-sm text-[#5B5B72] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#4338CA] hover:text-[#2E2A7A] transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
