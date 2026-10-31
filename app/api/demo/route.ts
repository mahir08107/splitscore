import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "@/lib/auth/demo-constants";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
    });

    if (error) {
      console.warn("[/api/demo] Sign in warning:", error.message);
    }
  } catch (err) {
    console.error("[/api/demo] Sign in error:", err);
  }

  // Set demo_mode cookie and redirect to dashboard
  const response = NextResponse.redirect(`${origin}/dashboard`, { status: 307 });
  response.cookies.set("demo_mode", "true", {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}

export async function POST(request: Request) {
  return GET(request);
}
