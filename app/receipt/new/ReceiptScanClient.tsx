"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Upload,
  Trash2,
  Plus,
  AlertTriangle,
  Check,
  ArrowLeft,
  Loader2,
  Users,
  Building2,
  UserCheck,
  Percent,
} from "lucide-react";
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_WIDTH_PX,
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
} from "@/lib/receipt/constants";
import type {
  ParsedReceipt,
  ReceiptItem,
  ReceiptParseResponse,
} from "@/lib/receipt/schema";
import {
  calculateReceiptSplits,
  type SplitItem,
} from "@/lib/receipt/splits";
import {
  saveReceiptToExistingGroupAction,
  createGroupWithReceiptAction,
  checkReceiptHashExistsAction,
  type ActiveGroupOption,
} from "@/lib/receipt/actions";

type Step = "upload" | "review";

interface ReceiptScanClientProps {
  currentUserId: string;
  initialGroupId?: string;
  activeGroups: ActiveGroupOption[];
}

export function ReceiptScanClient({
  currentUserId,
  initialGroupId,
  activeGroups,
}: ReceiptScanClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step state
  const [step, setStep] = useState<Step>("upload");

  // Upload step state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Group Destination state (Existing Group vs New Group)
  const [destinationMode, setDestinationMode] = useState<"existing" | "new">(
    initialGroupId || activeGroups.length > 0 ? "existing" : "new"
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroupId || (activeGroups[0]?.id ?? "")
  );

  // New Group Fields
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState<"trip" | "mess" | "event">("event");
  const [newGroupEmails, setNewGroupEmails] = useState("");

  // Review step receipt fields
  const [merchant, setMerchant] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [items, setItems] = useState<Array<ReceiptItem & { sharedByMemberIds?: string[] }>>([]);
  const [tax, setTax] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);

  // Member selection
  const [payerId, setPayerId] = useState<string>(currentUserId);
  const [selectedSharingMembers, setSelectedSharingMembers] = useState<string[]>([currentUserId]);

  // Idempotency key generated once when Review step opens
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  // Hash collision warning state
  const [isDuplicateHash, setIsDuplicateHash] = useState(false);
  const [confirmDuplicateProceed, setConfirmDuplicateProceed] = useState(false);

  // Submit / Confirm state
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Determine current active group details
  const currentGroup = useMemo(() => {
    return activeGroups.find((g) => g.id === selectedGroupId);
  }, [activeGroups, selectedGroupId]);

  // Available members for selection in existing group mode
  const availableMembers = useMemo(() => {
    if (destinationMode === "existing" && currentGroup) {
      return currentGroup.members;
    }
    // In new group mode, only current user is guaranteed
    return [{ id: currentUserId, name: "Me (You)", email: "" }];
  }, [destinationMode, currentGroup, currentUserId]);

  // Sync payer and sharing members when group changes
  useEffect(() => {
    if (availableMembers.length > 0) {
      const memberIds = availableMembers.map((m) => m.id);
      setSelectedSharingMembers(memberIds);
      if (!memberIds.includes(payerId)) {
        setPayerId(availableMembers[0]?.id || currentUserId);
      }
    }
  }, [availableMembers, currentUserId]);

  // Compute image SHA-256 in browser
  const computeImageHash = useCallback(async (base64: string): Promise<string> => {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return "";
    }
  }, []);

  // --- Image processing ---
  const resizeImage = useCallback(
    (file: File): Promise<{ base64: string; mimeType: string }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            let { width, height } = img;
            if (width > MAX_IMAGE_WIDTH_PX) {
              height = Math.round((height * MAX_IMAGE_WIDTH_PX) / width);
              width = MAX_IMAGE_WIDTH_PX;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Canvas not supported in this browser."));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            const outputMime = "image/jpeg";
            const dataUrl = canvas.toDataURL(outputMime, 0.85);
            const base64 = dataUrl.replace(
              /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
              ""
            );

            if (!base64 || base64.trim().length === 0) {
              reject(
                new Error(
                  "Image processing resulted in an empty file (0 bytes). Please select a valid photo."
                )
              );
              return;
            }

            resolve({ base64: base64.trim(), mimeType: outputMime });
          };
          img.onerror = () => reject(new Error("Could not load the image."));
          img.src = reader.result as string;
        };
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsDataURL(file);
      });
    },
    []
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadError(null);

      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        setUploadError("Only JPG, PNG and WebP images are allowed.");
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setUploadError("Image is too large. Maximum size is 5 MB.");
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      setUploading(true);
      try {
        const { base64, mimeType } = await resizeImage(file);

        if (!base64 || base64.length === 0) {
          setUploadError("The processed image has size 0. Upload blocked.");
          setUploading(false);
          return;
        }

        // Compute SHA-256
        const hash = await computeImageHash(base64);
        setImageHash(hash);

        // Check if hash already exists in target group if already selected
        if (selectedGroupId && hash) {
          const alreadyExists = await checkReceiptHashExistsAction(selectedGroupId, hash);
          setIsDuplicateHash(alreadyExists);
        }

        const res = await fetch("/api/receipt/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType }),
        });

        const data: ReceiptParseResponse = await res.json();

        if (!data.success || !data.data) {
          setUploadError(data.error || "Failed to read the receipt.");
          setUploading(false);
          return;
        }

        // Move to review step with real AI extracted data
        const extractedItems = (data.data.items || []).map((it) => ({
          ...it,
          sharedByMemberIds: undefined, // defaults to all selected sharing members
        }));

        setItems(extractedItems);
        setMerchant(data.data.merchant || "");
        setReceiptDate(data.data.date || new Date().toISOString().split("T")[0]);
        setTax(data.data.tax ?? 0);
        setServiceCharge(data.data.service_charge ?? 0);
        setDiscount(data.data.discount ?? 0);
        setWarning(data.warning || null);

        // Generate idempotency key for this review session
        setIdempotencyKey(crypto.randomUUID());
        setStep("review");
      } catch (err: any) {
        setUploadError(err?.message || "Something went wrong. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [resizeImage, computeImageHash, selectedGroupId]
  );

  // Manual fallback if scan fails
  const handleEnterManually = () => {
    setItems([{ name: "", quantity: 1, price: 0 }]);
    setMerchant("");
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setTax(0);
    setServiceCharge(0);
    setDiscount(0);
    setIdempotencyKey(crypto.randomUUID());
    setStep("review");
  };

  // --- Review Handlers ---
  const updateItem = (
    index: number,
    field: keyof ReceiptItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: "", quantity: 1, price: 0 }]);
  };

  const toggleItemMember = (itemIndex: number, memberId: string) => {
    setItems((prev) => {
      const next = [...prev];
      const currentShares =
        next[itemIndex].sharedByMemberIds || selectedSharingMembers;
      const hasMember = currentShares.includes(memberId);

      let newShares: string[];
      if (hasMember) {
        newShares = currentShares.filter((id) => id !== memberId);
      } else {
        newShares = [...currentShares, memberId];
      }

      next[itemIndex] = {
        ...next[itemIndex],
        sharedByMemberIds: newShares,
      };
      return next;
    });
  };

  const toggleSharingMember = (memberId: string) => {
    setSelectedSharingMembers((prev) => {
      if (prev.includes(memberId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  // Convert receipt items into SplitItem format
  const splitItems: SplitItem[] = useMemo(() => {
    return items.map((it) => ({
      name: it.name,
      price: Number(it.price) || 0,
      sharedByMemberIds:
        it.sharedByMemberIds && it.sharedByMemberIds.length > 0
          ? it.sharedByMemberIds.filter((id) => selectedSharingMembers.includes(id))
          : selectedSharingMembers,
    }));
  }, [items, selectedSharingMembers]);

  // Compute splits using largest-remainder method in paise
  const splitResult = useMemo(() => {
    return calculateReceiptSplits({
      items: splitItems,
      tax: Number(tax) || 0,
      serviceCharge: Number(serviceCharge) || 0,
      discount: Number(discount) || 0,
      payerId,
      allMemberIds: selectedSharingMembers,
    });
  }, [splitItems, tax, serviceCharge, discount, payerId, selectedSharingMembers]);

  // Check if splits equal total
  const isSplitBalanced = useMemo(() => {
    for (const exp of splitResult.expenses) {
      const sumSplits = exp.splits.reduce((a, b) => a + b.shareAmount, 0);
      if (Math.abs(Math.round(sumSplits * 100) - Math.round(exp.amount * 100)) > 1) {
        return false;
      }
    }
    return true;
  }, [splitResult]);

  // Handle Confirm Submission
  const handleConfirm = async () => {
    setConfirmError(null);

    if (items.length === 0) {
      setConfirmError("Add at least one item.");
      return;
    }

    const invalidItem = items.find(
      (i) => !i.name.trim() || Number(i.price) <= 0
    );
    if (invalidItem) {
      setConfirmError(
        "Every item must have a name and a price greater than zero."
      );
      return;
    }

    if (!isSplitBalanced) {
      setConfirmError(
        "Splits do not equal the expense amount. Please adjust item amounts."
      );
      return;
    }

    if (isDuplicateHash && !confirmDuplicateProceed) {
      setConfirmError(
        "A bill with this exact photo was already added to this group. Please check the confirmation box to proceed."
      );
      return;
    }

    setConfirming(true);

    try {
      if (destinationMode === "existing") {
        if (!selectedGroupId) {
          setConfirmError("Please select an existing group.");
          setConfirming(false);
          return;
        }

        const res = await saveReceiptToExistingGroupAction({
          groupId: selectedGroupId,
          paidBy: payerId,
          date: receiptDate || new Date().toISOString().split("T")[0],
          idempotencyKey,
          receiptHash: imageHash,
          expenses: splitResult.expenses,
        });

        if (!res.success) {
          setConfirmError(res.error || "Failed to save expenses to group.");
          setConfirming(false);
          return;
        }

        router.push(`/group/${selectedGroupId}`);
        router.refresh();
      } else {
        // New Group Mode
        if (!newGroupName.trim()) {
          setConfirmError("Please enter a name for the new group.");
          setConfirming(false);
          return;
        }

        const emails = newGroupEmails
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0 && e.includes("@"));

        const res = await createGroupWithReceiptAction({
          name: newGroupName.trim(),
          type: newGroupType,
          memberEmails: emails,
          paidBy: payerId,
          date: receiptDate || new Date().toISOString().split("T")[0],
          idempotencyKey,
          receiptHash: imageHash,
          expenses: splitResult.expenses,
        });

        if (!res.success || !res.groupId) {
          setConfirmError(res.error || "Failed to create group.");
          setConfirming(false);
          return;
        }

        router.push(`/group/${res.groupId}`);
        router.refresh();
      }
    } catch (err: any) {
      setConfirmError(err?.message || "Failed to save receipt. Please try again.");
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white pb-16">
      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5EF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={initialGroupId ? `/group/${initialGroupId}` : "/dashboard"}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5B5B72] hover:text-[#2E2A7A] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{initialGroupId ? "Back to Group" : "Back to Dashboard"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "upload"
                  ? "bg-[#2E2A7A] text-white"
                  : "bg-[#D1FAE5] text-[#065F46]"
              }`}
            >
              {step === "review" ? <Check className="w-4 h-4" /> : "1"}
            </span>
            <span className="text-xs font-semibold text-[#5B5B72]">Upload</span>

            <span className="text-[#9CA3AF]">—</span>

            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "review"
                  ? "bg-[#2E2A7A] text-white"
                  : "bg-[#E5E5EF] text-[#5B5B72]"
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-[#5B5B72]">Review & Split</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        {/* =================== STEP 1: UPLOAD =================== */}
        {step === "upload" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1D3D]">
                Scan a Bill
              </h1>
              <p className="text-sm text-[#5B5B72]">
                Take a photo or upload a receipt to parse items and split accurately
              </p>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                uploading
                  ? "border-[#4338CA] bg-[#EEF2FF]/30 cursor-wait"
                  : "border-[#D1D5DB] hover:border-[#4338CA] hover:bg-[#F8F9FD] bg-white"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-[#4338CA] animate-spin" />
                  <p className="text-sm font-semibold text-[#4338CA]">
                    Reading your receipt with Gemini AI...
                  </p>
                  <p className="text-xs text-[#5B5B72]">
                    Extracting purchased items, tax, and totals...
                  </p>
                </div>
              ) : previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="max-h-48 rounded-lg object-contain"
                  />
                  <p className="text-sm text-[#5B5B72]">
                    Click to choose a different image.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#F1F1FA] flex items-center justify-center">
                    <Camera className="w-8 h-8 text-[#4338CA]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[#1F1D3D]">
                      Upload a receipt photo
                    </p>
                    <p className="text-sm text-[#5B5B72] mt-1">
                      JPG, PNG or WebP up to 5 MB
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E2A7A] text-white text-sm font-semibold hover:bg-[#23205E] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </button>
                </div>
              )}
            </div>

            {/* Card privacy note */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FFF7ED] border border-[#FDE68A]">
              <AlertTriangle className="w-4 h-4 text-[#B45309] mt-0.5 shrink-0" />
              <p className="text-xs text-[#92400E] leading-relaxed">
                Do not upload receipts that show card numbers. We only read item
                names and prices. The image is never stored.
              </p>
            </div>

            {/* Upload Error banner with manual fallback */}
            {uploadError && (
              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-[#B91C1C]">
                <span>{uploadError}</span>
                <button
                  type="button"
                  onClick={handleEnterManually}
                  className="text-xs font-bold underline text-[#2E2A7A] hover:text-[#4338CA] self-start sm:self-auto shrink-0"
                >
                  Enter Items Manually Instead
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================== STEP 2: REVIEW & SPLIT =================== */}
        {step === "review" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1F1D3D]">
                  Review & Split Bill
                </h1>
                <p className="text-xs sm:text-sm text-[#5B5B72] mt-0.5">
                  Confirm line items, choose who paid, and split proportionally.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="text-xs font-semibold text-[#4338CA] hover:underline"
              >
                Scan another photo
              </button>
            </div>

            {/* Duplicate Hash Warning */}
            {isDuplicateHash && (
              <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FCD34D] space-y-2">
                <div className="flex items-start gap-2 text-sm font-bold text-[#B45309]">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Duplicate Receipt Detected</span>
                </div>
                <p className="text-xs text-[#92400E]">
                  A bill with this exact photo has already been added to this group.
                </p>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#92400E] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={confirmDuplicateProceed}
                    onChange={(e) => setConfirmDuplicateProceed(e.target.checked)}
                    className="rounded border-[#FCD34D] text-[#2E2A7A] focus:ring-[#2E2A7A]"
                  />
                  <span>I understand and confirm adding this bill again</span>
                </label>
              </div>
            )}

            {/* Warning from AI total check */}
            {warning && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FFF7ED] border border-[#FDE68A]">
                <AlertTriangle className="w-4 h-4 text-[#B45309] mt-0.5 shrink-0" />
                <p className="text-xs text-[#92400E] leading-relaxed">
                  {warning}
                </p>
              </div>
            )}

            {/* Group Selection: Existing vs New Group */}
            {!initialGroupId && (
              <div className="bg-white rounded-2xl border border-[#E5E5EF] p-5 space-y-4">
                <label className="block text-xs font-bold text-[#5B5B72] uppercase tracking-wider">
                  Where should this bill be added?
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDestinationMode("existing")}
                    disabled={activeGroups.length === 0}
                    className={`flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                      destinationMode === "existing"
                        ? "border-[#2E2A7A] bg-[#EEF2FF] text-[#2E2A7A]"
                        : "border-[#E5E5EF] text-[#5B5B72] hover:bg-[#F8F9FD]"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Existing Group ({activeGroups.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDestinationMode("new")}
                    className={`flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                      destinationMode === "new"
                        ? "border-[#2E2A7A] bg-[#EEF2FF] text-[#2E2A7A]"
                        : "border-[#E5E5EF] text-[#5B5B72] hover:bg-[#F8F9FD]"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Group</span>
                  </button>
                </div>

                {destinationMode === "existing" ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#5B5B72] mb-1.5">
                      Select Group
                    </label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E5E5EF] bg-[#F8F9FD] text-sm text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                    >
                      {activeGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.members.length} member{g.members.length !== 1 ? "s" : ""})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#5B5B72] mb-1.5">
                        Group Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Goa Trip, Dinner at Toit"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E5EF] bg-[#F8F9FD] text-sm text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#5B5B72] mb-1.5">
                          Group Type
                        </label>
                        <select
                          value={newGroupType}
                          onChange={(e) => setNewGroupType(e.target.value as any)}
                          className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E5E5EF] bg-[#F8F9FD] text-sm text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                        >
                          <option value="trip">Trip</option>
                          <option value="mess">Mess</option>
                          <option value="event">Event</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5B5B72] mb-1.5">
                          Invite Members (Emails, comma-separated)
                        </label>
                        <input
                          type="text"
                          placeholder="friend@college.edu"
                          value={newGroupEmails}
                          onChange={(e) => setNewGroupEmails(e.target.value)}
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E5EF] bg-[#F8F9FD] text-sm text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Who Paid & Who Shares */}
            <div className="bg-white rounded-2xl border border-[#E5E5EF] p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payer Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#5B5B72] uppercase tracking-wider mb-1.5">
                    Who Paid for the Bill?
                  </label>
                  <select
                    value={payerId}
                    onChange={(e) => setPayerId(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E5E5EF] bg-[#F8F9FD] text-sm text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                  >
                    {availableMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.id === currentUserId ? "(Me)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Merchant */}
                <div>
                  <label className="block text-xs font-bold text-[#5B5B72] uppercase tracking-wider mb-1.5">
                    Merchant & Date
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Merchant"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E5E5EF] bg-[#F8F9FD] text-xs sm:text-sm text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                    />
                    <input
                      type="date"
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E5E5EF] bg-[#F8F9FD] text-xs sm:text-sm text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                    />
                  </div>
                </div>
              </div>

              {/* Group-Wide Sharing Members */}
              {availableMembers.length > 1 && (
                <div className="pt-2 border-t border-[#E5E5EF]">
                  <label className="block text-xs font-bold text-[#5B5B72] uppercase tracking-wider mb-2">
                    Who Participates in this Bill?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableMembers.map((m) => {
                      const isSelected = selectedSharingMembers.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleSharingMember(m.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[36px] transition-all ${
                            isSelected
                              ? "bg-[#2E2A7A] text-white"
                              : "bg-[#F1F1FA] text-[#5B5B72] hover:bg-[#E5E5F5]"
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="bg-white rounded-2xl border border-[#E5E5EF] overflow-hidden">
              <div className="px-4 py-3 bg-[#F8F9FD] border-b border-[#E5E5EF] flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#1F1D3D]">Line Items</h2>
                  <p className="text-xs text-[#5B5B72]">
                    Edit items or customize who shares individual lines
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2E2A7A] text-white text-xs font-semibold hover:bg-[#23205E] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="divide-y divide-[#F1F1FA]">
                {items.map((item, idx) => {
                  const currentItemShares =
                    item.sharedByMemberIds || selectedSharingMembers;

                  return (
                    <div key={idx} className="p-4 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => updateItem(idx, "name", e.target.value)}
                          className="flex-1 min-h-[40px] px-3 py-1.5 rounded-lg border border-[#E5E5EF] bg-[#F8F9FD] text-sm text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                        />

                        <div className="w-20">
                          <input
                            type="number"
                            min={1}
                            placeholder="Qty"
                            value={item.quantity ?? 1}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full min-h-[40px] px-2 py-1.5 rounded-lg border border-[#E5E5EF] bg-[#F8F9FD] text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                          />
                        </div>

                        <div className="w-28 relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5B5B72]">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full min-h-[40px] pl-6 pr-2.5 py-1.5 rounded-lg border border-[#E5E5EF] bg-[#F8F9FD] text-sm text-right font-semibold text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-2 rounded-lg text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Per-item sharing member tags (optional customization) */}
                      {availableMembers.length > 1 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-[#5B5B72] mr-1">
                            Shares:
                          </span>
                          {availableMembers.map((m) => {
                            const isShared = currentItemShares.includes(m.id);
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => toggleItemMember(idx, m.id)}
                                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-all ${
                                  isShared
                                    ? "bg-[#EEF2FF] text-[#4338CA] border border-[#4338CA]/30 font-semibold"
                                    : "bg-gray-100 text-gray-400 line-through"
                                }`}
                              >
                                {m.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tax, Service Charge, Discount Breakdown */}
              <div className="px-4 py-4 bg-[#F8F9FD] border-t border-[#E5E5EF] space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-[#5B5B72]">Tax (GST / VAT)</span>
                  <div className="w-28 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5B5B72]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={tax}
                      onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                      className="w-full min-h-[36px] pl-6 pr-2.5 py-1 rounded-lg border border-[#E5E5EF] bg-white text-xs sm:text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#4338CA]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-[#5B5B72]">Service Charge</span>
                  <div className="w-28 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5B5B72]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={serviceCharge}
                      onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                      className="w-full min-h-[36px] pl-6 pr-2.5 py-1 rounded-lg border border-[#E5E5EF] bg-white text-xs sm:text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#4338CA]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-[#5B5B72]">Discount</span>
                  <div className="w-28 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5B5B72]">
                      -₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full min-h-[36px] pl-7 pr-2.5 py-1 rounded-lg border border-[#E5E5EF] bg-white text-xs sm:text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#4338CA]"
                    />
                  </div>
                </div>

                {/* Final Bill Total */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E5E5EF]">
                  <span className="text-sm sm:text-base font-bold text-[#1F1D3D]">
                    Bill Total
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-[#2E2A7A]">
                    ₹{splitResult.totalBill.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Proportional Split Breakdown by Member */}
            <div className="bg-white rounded-2xl border border-[#E5E5EF] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#5B5B72] uppercase tracking-wider">
                  Calculated Split Summary (Paise Precision)
                </h3>
                <span className="text-[11px] font-semibold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded-full">
                  100% Balanced
                </span>
              </div>

              <div className="divide-y divide-[#F1F1FA]">
                {selectedSharingMembers.map((uid) => {
                  const member = availableMembers.find((m) => m.id === uid);
                  const memberShare = splitResult.memberTotals[uid] || 0;
                  const isPayer = uid === payerId;

                  return (
                    <div
                      key={uid}
                      className="flex items-center justify-between py-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1F1D3D]">
                          {member?.name || "Member"}
                        </span>
                        {isPayer && (
                          <span className="text-[10px] bg-[#EEF2FF] text-[#4338CA] px-2 py-0.5 rounded-full font-bold">
                            Payer
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-[#1F1D3D]">
                        ₹{memberShare.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error display */}
            {confirmError && (
              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C]">
                {confirmError}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep("upload")}
                disabled={confirming}
                className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm font-semibold text-[#5B5B72] hover:bg-[#F1F1FA] transition-colors"
              >
                Back to Upload
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirming || !isSplitBalanced}
                className="min-h-[44px] px-7 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Group...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Save Bill</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
