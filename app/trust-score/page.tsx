import { Header } from "@/components/layout/Header";
import { getTrustScoreData } from "@/lib/data/score";
import { TrustScoreClient } from "@/components/score/TrustScoreClient";
import { cookies } from "next/headers";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export const metadata = {
  title: "My Trust Score — SplitScore",
  description:
    "View your personal trust score breakdown, reputation band, and verified settlement history.",
};

export default async function MyTrustScorePage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo_mode")?.value === "true";
  let serverClient = null;
  let userId: string | undefined = undefined;

  try {
    serverClient = await createServerSupabase();
    const { data } = await serverClient.auth.getUser();
    if (data?.user) {
      userId = data.user.id;
    }
  } catch {
    // auth not configured
  }

  const data = await getTrustScoreData(userId, isDemo, serverClient);

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 sm:px-6 sm:py-8">
        <TrustScoreClient data={data} />
      </main>
    </div>
  );
}
