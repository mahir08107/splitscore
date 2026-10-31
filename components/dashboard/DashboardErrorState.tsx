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
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#FECACA] p-6 text-center soft-card-shadow">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#B91C1C] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#1C1917] font-display">
          Unable to load dashboard
        </h3>
        <p className="text-xs text-[#57534E] mt-1.5 mb-5 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 text-white font-medium text-xs tracking-wide uppercase transition-all shadow-sm active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry loading</span>
        </button>
      </div>
    </div>
  );
}
