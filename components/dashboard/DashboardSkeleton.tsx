import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] animate-pulse">
      {/* Header skeleton */}
      <div className="w-full bg-white border-b border-[rgba(225,29,72,0.09)] h-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="w-32 h-6 bg-gray-200 rounded"></div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-8 bg-gray-200 rounded"></div>
            <div className="w-9 h-9 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Main container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-32 bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-5 flex flex-col justify-between">
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="w-32 h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-32 bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-5 flex flex-col justify-between">
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            <div className="w-32 h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-32 bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-5 flex flex-col justify-between">
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            <div className="w-28 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Pending actions skeleton */}
        <div>
          <div className="w-36 h-5 bg-gray-200 rounded mb-3"></div>
          <div className="h-20 bg-white rounded-2xl border border-[rgba(225,29,72,0.09)]"></div>
        </div>

        {/* Groups skeleton */}
        <div>
          <div className="w-32 h-5 bg-gray-200 rounded mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="h-28 bg-white rounded-2xl border border-[rgba(225,29,72,0.09)]"></div>
            <div className="h-28 bg-white rounded-2xl border border-[rgba(225,29,72,0.09)]"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
