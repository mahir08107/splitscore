import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/dashboard`, { status: 307 });
  
  response.cookies.set("demo_mode", "true", {
    path: "/",
    maxAge: 86400, // 24 hours
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}

export async function POST(request: Request) {
  return GET(request);
}

