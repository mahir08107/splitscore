import Link from "next/link";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Public Trust Card — SplitScore",
  description: "Verifiable reputation card showing user trust band and verified settlements.",
};

export default async function PublicTrustCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#F1F1FA] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-[#E5E5EF] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] bg-[#0F766E]/10 px-2.5 py-1 rounded-md">
              Public Verifiable Trust Card
            </span>
            <span className="text-xs text-[#5B5B72]">ID: {id}</span>
          </div>

          <h1 className="text-2xl font-bold text-[#2E2A7A] mb-1">
            Trust Card
          </h1>
          <p className="text-sm text-[#5B5B72] mb-6">
            Publicly shareable card accessible to anyone without requiring an account.
          </p>

          <div className="border border-dashed border-[#D1D1DF] rounded-xl p-6 bg-[#F8F8FC] mb-6 text-center">
            <div className="text-4xl font-extrabold text-[#4338CA] mb-2">--</div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#5B5B72] mb-3">
              Score Placeholder
            </p>
            <p className="text-xs text-[#5B5B72] max-w-sm mx-auto">
              This card will display the user name, score band, confidence indicator, and verifiable signed cryptographic token with no private expense details exposed.
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 text-sm font-medium text-[#4338CA] border border-[#4338CA] hover:bg-[#F1F1FA] rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
