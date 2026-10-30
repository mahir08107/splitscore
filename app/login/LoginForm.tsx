"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if redirected with an error query param
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "auth_callback_failed") {
        setErrorMessage("Authentication failed during callback. Please try again.");
      } else {
        setErrorMessage(decodeURIComponent(errorParam));
      }
    }

    // Check if user is already signed in via Supabase or demo cookie
    const checkExistingSession = async () => {
      // Check cookie
      if (document.cookie.includes("demo_mode=")) {
        router.replace("/dashboard");
        return;
      }

      // Check supabase session
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.replace("/dashboard");
        }
      } catch {
        // Supabase keys might not be configured yet in dev
      }
    };

    checkExistingSession();
  }, [router, searchParams]);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoadingGoogle(true);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Unable to initiate Google sign in.");
        setLoadingGoogle(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to authentication service.";
      setErrorMessage(
        process.env.NEXT_PUBLIC_SUPABASE_URL
          ? msg
          : "Supabase environment variables are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoadingGoogle(false);
    }
  };

  const handleTryDemo = () => {
    setLoadingDemo(true);
    setErrorMessage(null);

    // Set demo_mode cookie for 24 hours
    document.cookie = "demo_mode=true; path=/; max-age=86400; SameSite=Lax";

    // Navigate to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5EF] p-6 sm:p-8 shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2E2A7A] text-white font-bold text-xl mb-4">
          S
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2E2A7A]">
          SplitScore
        </h1>
        <p className="text-sm text-[#5B5B72] mt-1">
          Split fair. Score fair.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-3.5 bg-red-50 border border-[#B91C1C]/20 rounded-xl text-xs sm:text-sm text-[#B91C1C] flex items-start gap-2.5"
        >
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      <div className="space-y-3.5">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle || loadingDemo}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-[#D1D1DF] bg-white hover:bg-slate-50 text-[#1F1D3D] font-medium text-sm sm:text-base flex items-center justify-center gap-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
        >
          {loadingGoogle ? (
            <span>Connecting to Google...</span>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="relative py-2 flex items-center justify-center">
          <div className="w-full border-t border-[#E5E5EF]"></div>
          <span className="absolute bg-white px-3 text-xs uppercase tracking-wider text-[#5B5B72]">
            or
          </span>
        </div>

        <button
          type="button"
          onClick={handleTryDemo}
          disabled={loadingGoogle || loadingDemo}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#F1F1FA] hover:bg-[#E5E5F5] text-[#2E2A7A] font-semibold text-sm sm:text-base border border-[#E0E0F0] flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
        >
          {loadingDemo ? "Opening Demo..." : "Try Demo"}
        </button>
      </div>

      <p className="text-center text-xs text-[#5B5B72] mt-6 leading-relaxed">
        By continuing, you agree to fair expense sharing and transparent reputation scoring.
      </p>
    </div>
  );
}

