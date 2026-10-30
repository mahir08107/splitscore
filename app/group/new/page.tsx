"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateGroupModal } from "@/components/group/CreateGroupModal";
import { ToastProvider } from "@/components/group/ToastContext";

export default function NewGroupPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/dashboard");
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4">
        <CreateGroupModal isOpen={isOpen} onClose={handleClose} />
      </div>
    </ToastProvider>
  );
}
