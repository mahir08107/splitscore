import { Header } from "@/components/layout/Header";
import { getPublicTrustCardData } from "@/lib/data/score";
import { PublicTrustCardClient } from "@/components/trust/PublicTrustCardClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getPublicTrustCardData(id);

  return {
    title: `${data.userName}'s Trust Card (${data.score}) — SplitScore`,
    description: `View ${data.userName}'s verified financial reputation score (${data.score} • ${data.band}). Authenticated and signed by SplitScore with zero private transaction details exposed.`,
  };
}

export default async function PublicTrustCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicTrustCardData(id);

  return (
    <div className="min-h-screen bg-[#F1F1FA] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center py-8">
        <PublicTrustCardClient data={data} />
      </main>

      <footer className="w-full text-center text-xs text-[#5B5B72] py-6 border-t border-[#E5E5EF]">
        <p>Team Null Pointers • Split fair. Score fair.</p>
      </footer>
    </div>
  );
}
