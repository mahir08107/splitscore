import { Suspense } from "react";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata = {
  title: "Sign Up — SplitScore",
  description: "Create your SplitScore account to split expenses and build your verified social credit score.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F1F1FA] flex flex-col justify-between p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto pt-4 sm:pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5B5B72] hover:text-[#1F1D3D] min-h-[44px] px-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to SplitScore
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-auto py-8">
        <Suspense fallback={<div className="bg-white p-8 rounded-2xl border border-[#E5E5EF] text-center text-[#5B5B72]">Loading sign up...</div>}>
          <SignupForm />
        </Suspense>
      </div>

      <footer className="w-full max-w-md mx-auto text-center text-xs text-[#5B5B72] pb-4">
        <p>Team Null Pointers | Split fair. Score fair.</p>
      </footer>
    </div>
  );
}
