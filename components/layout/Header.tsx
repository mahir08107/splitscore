import Link from "next/link";

interface HeaderProps {
  showBackToHome?: boolean;
}

export function Header({ showBackToHome = false }: HeaderProps) {
  return (
    <header className="w-full bg-[#FCFBF7]/90 backdrop-blur-md border-b hairline-rose-border sticky top-0 z-50 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display font-bold text-lg sm:text-xl tracking-tight text-[#1C1917] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] rounded-xl"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-[#E11D48]/20">
            S
          </div>
          <span>SplitScore</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/how-scoring-works"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-sm font-medium text-[#57534E] hover:text-[#E11D48] transition-colors rounded-xl"
          >
            How it works
          </Link>
          <Link
            href="/simulator"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-sm font-medium text-[#57534E] hover:text-[#E11D48] transition-colors rounded-xl"
          >
            Simulator
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-sm font-semibold text-[#1C1917] hover:text-[#E11D48] hover:bg-[#FFF1F2] border border-[rgba(225,29,72,0.12)] rounded-xl transition-all shadow-sm"
          >
            Dashboard
          </Link>
          
          {showBackToHome ? (
            <Link
              href="/"
              className="hidden md:inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-sm font-medium text-[#57534E] hover:text-[#E11D48] transition-colors"
            >
              Home
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center min-h-[44px] px-4 sm:px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 rounded-xl transition-all active:scale-95"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
