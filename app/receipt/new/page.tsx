import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserActiveGroupsAction } from "@/lib/receipt/actions";
import { ReceiptScanClient } from "./ReceiptScanClient";

export const metadata = {
  title: "Scan a Bill | SplitScore",
  description: "Upload a receipt photo and split it with your group instantly",
};

interface ReceiptNewPageProps {
  searchParams: Promise<{ group_id?: string }>;
}

export default async function ReceiptNewPage({ searchParams }: ReceiptNewPageProps) {
  const params = await searchParams;
  const initialGroupId = params.group_id;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect("/login?next=/receipt/new" + (initialGroupId ? `?group_id=${initialGroupId}` : ""));
  }

  const currentUserId = authData.user.id;
  const activeGroups = await getUserActiveGroupsAction();

  return (
    <ReceiptScanClient
      currentUserId={currentUserId}
      initialGroupId={initialGroupId}
      activeGroups={activeGroups}
    />
  );
}
