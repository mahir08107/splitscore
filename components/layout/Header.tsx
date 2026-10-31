import Link from "next/link";
import Image from "next/image";
import { HeaderAuthButtons } from "@/components/layout/HeaderAuthButtons";

interface HeaderProps {
  showBackToHome?: boolean;
}

export function Header({ showBackToHome = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/60 bg-[#0A0C10]/90 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded text-white font-semibold text-lg sm:text-xl tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5BC5A7]"
        >
          <Image src="/logo.png" alt="SplitScore" width={140} height={28} className="h-7 w-[140px] object-cover" />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/how-scoring-works"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5BC5A7] rounded"
          >
            How it works
          </Link>
          <Link
            href="/simulator"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5BC5A7] rounded"
          >
            Simulator
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-sm font-medium text-[#5BC5A7] hover:bg-[#5BC5A7]/10 border border-slate-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5BC5A7]"
          >
            Dashboard
          </Link>
          
          {showBackToHome && (
            <Link
              href="/"
              className="hidden md:inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Home
            </Link>
          )}

          <HeaderAuthButtons />
        </nav>
      </div>
    </header>
  );
}

