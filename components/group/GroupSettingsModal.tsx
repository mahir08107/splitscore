"use client";

import React, { useState, useEffect } from "react";
import { GroupModel, MemberRole } from "@/lib/group/types";
import { GroupType } from "@/lib/data/dashboard";
import { X, RefreshCw, Trash2, LogOut, Settings, AlertTriangle } from "lucide-react";
import { useToast } from "./ToastContext";

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupModel;
  currentUserRole: MemberRole;
  isOnlyAdmin: boolean;
  onUpdateGroup: (updates: { name?: string; type?: GroupType; description?: string }) => void;
  onRegenerateCode: () => void;
  onDeleteGroup: () => void;
  onLeaveGroup: () => void;
}

export function GroupSettingsModal({
  isOpen,
  onClose,
  group,
  currentUserRole,
  isOnlyAdmin,
  onUpdateGroup,
  onRegenerateCode,
  onDeleteGroup,
  onLeaveGroup,
}: GroupSettingsModalProps) {
  const { showToast } = useToast();
  const isAdmin = currentUserRole === "admin";

  const [name, setName] = useState(group.name);
  const [type, setType] = useState<GroupType>(group.type);
  const [description, setDescription] = useState(group.description || "");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(group.name);
      setType(group.type);
      setDescription(group.description || "");
      setDeleteConfirmationText("");
      setShowDeleteConfirm(false);
      setShowLeaveConfirm(false);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, group]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Group name cannot be empty.", "error");
      return;
    }
    onUpdateGroup({
      name: name.trim(),
      type,
      description: description.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (deleteConfirmationText.trim().toLowerCase() !== group.name.trim().toLowerCase()) {
      showToast("Group name does not match confirmation text.", "error");
      return;
    }
    onDeleteGroup();
  };

  const handleLeave = () => {
    if (isOnlyAdmin) {
      showToast("You cannot leave as the only admin. Promote another member first.", "error");
      return;
    }
    onLeaveGroup();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl border border-[rgba(225,29,72,0.09)] shadow-xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 id="settings-modal-title" className="text-xl font-bold font-display text-[#1C1917]">
              Group Settings
            </h2>
            <p className="text-xs text-[#57534E]">
              {isAdmin ? "Manage group details, invite access, and roles" : "View group details and preferences"}
            </p>
          </div>
        </div>

        {/* 1. Admin Edit Details Form */}
        {isAdmin ? (
          <form onSubmit={handleSave} className="space-y-4 mb-8">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#57534E] block mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 min-h-[44px] rounded-lg border border-[rgba(225,29,72,0.09)] bg-white text-sm text-[#1C1917] focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#57534E] block mb-1">
                Group Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GroupType)}
                className="w-full px-3.5 min-h-[44px] rounded-lg border border-[rgba(225,29,72,0.09)] bg-white text-sm text-[#1C1917] focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
              >
                <option value="trip">Trip (Vacations, road trips, travel)</option>
                <option value="mess">Mess (Hostel, shared meals, groceries)</option>
                <option value="event">Event (Parties, fests, hackathons)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#57534E] block mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What is this group for?"
                className="w-full p-3 rounded-lg border border-[rgba(225,29,72,0.09)] bg-white text-sm text-[#1C1917] focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-lg bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 text-white font-semibold text-xs uppercase tracking-wide transition-all shadow-sm active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-[#FCFBF7] p-4 rounded-xl border border-[rgba(225,29,72,0.09)] mb-6 space-y-2 text-sm text-[#1C1917]">
            <p><strong>Name:</strong> {group.name}</p>
            <p><strong>Type:</strong> <span className="capitalize">{group.type}</span></p>
            {group.description && <p><strong>Description:</strong> {group.description}</p>}
          </div>
        )}

        {/* 2. Regenerate Invite Code (Admins only) */}
        {isAdmin && (
          <div className="p-4 rounded-xl border border-[rgba(225,29,72,0.09)] bg-[#FCFBF7] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-[#1C1917]">Invite Code</h4>
              <p className="text-xs text-[#57534E]">
                Current code: <span className="font-mono font-bold text-[#E11D48]">{group.invite_code}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onRegenerateCode}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg border border-[rgba(225,29,72,0.09)] bg-white hover:bg-rose-50 text-[#1C1917] text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate code</span>
            </button>
          </div>
        )}

        {/* 3. Danger Zone: Leave Group or Delete Group */}
        <div className="pt-6 border-t border-[rgba(225,29,72,0.09)] space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#B91C1C]">
            Danger Zone
          </h4>

          {/* Leave Group Action (All members) */}
          {!showLeaveConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#1C1917]">Leave Group</p>
                <p className="text-xs text-[#57534E]">
                  {isOnlyAdmin
                    ? "Blocked: You are the sole admin."
                    : "Remove yourself from this group."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(true)}
                disabled={isOnlyAdmin}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg border border-[#FECACA] text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-3">
              <p className="text-xs font-semibold text-[#B91C1C]">
                Are you sure you want to leave this group?
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="min-h-[40px] px-3 rounded-lg bg-white border border-[#FECACA] text-xs font-semibold text-[#57534E]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLeave}
                  className="min-h-[40px] px-4 rounded-lg bg-[#B91C1C] text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Confirm Leave
                </button>
              </div>
            </div>
          )}

          {/* Delete Group Action (Admins only with typed confirmation) */}
          {isAdmin && (
            <div className="pt-3 border-t border-[rgba(225,29,72,0.06)]">
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#B91C1C]">Delete Group</p>
                    <p className="text-xs text-[#57534E]">
                      Permanently delete this group and its expenses.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991b1b] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B91C1C]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Type &ldquo;{group.name}&rdquo; to confirm deletion:</span>
                  </div>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder={group.name}
                    className="w-full px-3.5 min-h-[44px] rounded-lg border border-[#FECACA] bg-white text-xs text-[#1C1917] focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmationText("");
                      }}
                      className="min-h-[40px] px-3 rounded-lg bg-white border border-[rgba(225,29,72,0.09)] text-xs font-semibold text-[#57534E]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteConfirmationText.trim().toLowerCase() !== group.name.trim().toLowerCase()}
                      className="min-h-[40px] px-4 rounded-lg bg-[#B91C1C] hover:bg-[#991b1b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Permanently Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
