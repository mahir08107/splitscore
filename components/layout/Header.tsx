import Link from "next/link";

interface HeaderProps {
  showBackToHome?: boolean;
}

export function Header({ showBackToHome = false }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-[#E5E5EF] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#2E2A7A] font-semibold text-lg sm:text-xl tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded"
        >
          <span className="w-8 h-8 rounded-lg bg-[#2E2A7A] text-white flex items-center justify-center font-bold text-sm">
            S
          </span>
          <span>SplitScore</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/how-scoring-works"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm text-[#5B5B72] hover:text-[#1F1D3D] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded"
          >
            How it works
          </Link>
          <Link
            href="/simulator"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm text-[#5B5B72] hover:text-[#1F1D3D] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded"
          >
            Simulator
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-sm font-medium text-[#2E2A7A] hover:bg-[#F1F1FA] border border-[#E5E5EF] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
          >
            Dashboard
          </Link>
          
          {showBackToHome ? (
            <Link
              href="/"
              className="hidden md:inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-sm font-medium text-[#5B5B72] hover:text-[#1F1D3D] transition-colors"
            >
              Home
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-[#4338CA] hover:bg-[#2E2A7A] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

