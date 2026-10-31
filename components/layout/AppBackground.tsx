"use client";

import { usePathname } from "next/navigation";

export default function AppBackground() {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  if (isAuthRoute) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[#0A0C10]" />
      <div className="absolute -left-48 -top-48 h-[38rem] w-[38rem] rounded-full bg-[#5BC5A7]/[0.07] blur-[150px]" />
      <div className="absolute -bottom-72 -right-48 h-[42rem] w-[42rem] rounded-full bg-[#5BC5A7]/[0.05] blur-[170px]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(91,197,167,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 95% 85% at 50% 50%, transparent 35%, black 90%)",
        }}
      />
    </div>
  );
}
