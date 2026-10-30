"use client";

import { useState } from "react";

interface TryDemoButtonProps {
  className?: string;
}

export function TryDemoButton({ className }: TryDemoButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDemo = () => {
    setLoading(true);
    document.cookie = "demo_mode=true; path=/; max-age=86400; SameSite=Lax";
    window.location.href = "/dashboard";
  };

  return (
    <button
      type="button"
      onClick={handleDemo}
      disabled={loading}
      className={className}
    >
      {loading ? "Opening Demo..." : "Try Demo"}
    </button>
  );
}

