import { Header } from "@/components/layout/Header";
import { getTrustScoreData } from "@/lib/data/score";
import { TrustScoreClient } from "@/components/score/TrustScoreClient";

export const metadata = {
  title: "My Trust Score — SplitScore",
  description:
    "View your personal trust score breakdown, reputation band, and verified settlement history.",
};

export default async function MyTrustScorePage() {
  const data = await getTrustScoreData();

  return (
    <div className="min-h-screen bg-[#F1F1FA] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 sm:px-6 sm:py-8">
        <TrustScoreClient data={data} />
      </main>
    </div>
  );
}
