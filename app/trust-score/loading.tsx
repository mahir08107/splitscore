import { Header } from "@/components/layout/Header";

export default function TrustScoreLoading() {
  return (
    <div className="min-h-screen bg-[#F1F1FA] flex flex-col animate-pulse">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 sm:px-6 sm:py-8 space-y-5">
        {/* Nav Skeleton */}
        <div className="flex justify-between items-center">
          <div className="w-28 h-6 bg-gray-200 rounded-lg" />
          <div className="w-32 h-6 bg-gray-200 rounded-lg" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="h-56 bg-white rounded-2xl border border-[#E5E5EF] p-6 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="w-24 h-5 bg-gray-200 rounded" />
            <div className="w-20 h-5 bg-gray-200 rounded-full" />
          </div>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200" />
            <div className="space-y-3 flex-1">
              <div className="w-36 h-5 bg-gray-200 rounded" />
              <div className="w-48 h-4 bg-gray-200 rounded" />
              <div className="w-full h-3 bg-gray-200 rounded-full" />
            </div>
          </div>
          <div className="w-40 h-4 bg-gray-200 rounded" />
        </div>

        {/* Chart Skeleton */}
        <div className="h-56 bg-white rounded-2xl border border-[#E5E5EF] p-5">
          <div className="w-28 h-5 bg-gray-200 rounded mb-4" />
          <div className="w-full h-36 bg-gray-100 rounded-xl" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-xl border border-[#E5E5EF] p-4 flex flex-col justify-between"
            >
              <div className="w-16 h-3 bg-gray-200 rounded" />
              <div className="w-12 h-6 bg-gray-200 rounded" />
              <div className="w-20 h-2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
