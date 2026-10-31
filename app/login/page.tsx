import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign In — SplitScore",
  description: "Sign in to manage your group splits and build your trust score.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col justify-between p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto pt-4 sm:pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#57534E] hover:text-[#1C1917] min-h-[44px] px-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to SplitScore
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-auto py-8">
        <Suspense fallback={<div className="bg-white p-8 rounded-2xl border border-[rgba(225,29,72,0.09)] text-center text-[#57534E]">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      <footer className="w-full max-w-md mx-auto text-center text-xs text-[#57534E] pb-4">
        <p>Team Null Pointers | Split fair. Score fair.</p>
      </footer>
    </div>
  );
}

