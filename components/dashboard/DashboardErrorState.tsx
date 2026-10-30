import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface DashboardErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function DashboardErrorState({
  message = "Failed to load dashboard data. Please check your network or database connection.",
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#FECACA] p-6 text-center shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#B91C1C] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#1F1D3D]">
          Unable to load dashboard
        </h3>
        <p className="text-xs text-[#5B5B72] mt-1.5 mb-5 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#2E2A7A] hover:bg-[#252263] text-white font-medium text-xs tracking-wide uppercase transition-all shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry loading</span>
        </button>
      </div>
    </div>
  );
}
