"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GroupType } from "@/lib/data/dashboard";
import { createGroup } from "@/lib/group/service";
import { X, Plus, Compass, Utensils, CalendarDays } from "lucide-react";
import { useToast } from "./ToastContext";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  isDemo?: boolean;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  currentUserId,
  isDemo = false,
}: CreateGroupModalProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [type, setType] = useState<GroupType>("trip");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setType("trip");
      setDescription("");
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a group name.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await createGroup(
        {
          name: name.trim(),
          type,
          description: description.trim() || undefined,
        },
        currentUserId,
        isDemo
      );

      if (!result.success || !result.group) {
        showToast(result.error || "Failed to create group.", "error");
        setLoading(false);
        return;
      }

      showToast(`Group "${result.group.name}" created successfully!`, "success");
      onClose();
      // Navigate to the new group page
      router.push(`/group/${result.group.id}`);
    } catch {
      showToast("An unexpected error occurred while creating group.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-group-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl border border-[#E5E5F0] shadow-xl p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#5B5B72] hover:text-[#1F1D3D] hover:bg-[#F1F1FA] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#2E2A7A] text-white flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 id="create-group-title" className="text-xl font-bold text-[#1F1D3D]">
              Create New Group
            </h2>
            <p className="text-xs text-[#5B5B72]">
              Set up a group to track and split shared expenses
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#5B5B72] block mb-1">
              Group Name <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Manali Trip, Flat 402 Mess, Hackathon Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 min-h-[44px] rounded-lg border border-[#E5E5F0] bg-white text-sm text-[#1F1D3D] placeholder:text-[#5B5B72]/60 focus:outline-none focus:border-[#4338CA] focus:ring-1 focus:ring-[#4338CA]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#5B5B72] block mb-1">
              Group Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("trip")}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 min-h-[64px] ${
                  type === "trip"
                    ? "bg-[#EEF2FF] border-[#4338CA] text-[#4338CA] font-bold"
                    : "bg-white border-[#E5E5F0] text-[#5B5B72] hover:bg-[#F8F9FD]"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span className="text-xs">Trip</span>
              </button>

              <button
                type="button"
                onClick={() => setType("mess")}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 min-h-[64px] ${
                  type === "mess"
                    ? "bg-[#F0FDFA] border-[#0F766E] text-[#0F766E] font-bold"
                    : "bg-white border-[#E5E5F0] text-[#5B5B72] hover:bg-[#F8F9FD]"
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span className="text-xs">Mess</span>
              </button>

              <button
                type="button"
                onClick={() => setType("event")}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 min-h-[64px] ${
                  type === "event"
                    ? "bg-[#FFFBEB] border-[#B45309] text-[#B45309] font-bold"
                    : "bg-white border-[#E5E5F0] text-[#5B5B72] hover:bg-[#F8F9FD]"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span className="text-xs">Event</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#5B5B72] block mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Add details, itinerary, or mess rules..."
              className="w-full p-3 rounded-lg border border-[#E5E5F0] bg-white text-sm text-[#1F1D3D] placeholder:text-[#5B5B72]/60 focus:outline-none focus:border-[#4338CA] focus:ring-1 focus:ring-[#4338CA]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-[44px] px-4 rounded-lg border border-[#E5E5F0] text-xs font-semibold text-[#5B5B72] hover:bg-[#F8F9FD] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] px-6 rounded-lg bg-[#2E2A7A] hover:bg-[#252263] text-white font-semibold text-xs uppercase tracking-wide transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
