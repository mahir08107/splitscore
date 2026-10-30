import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  let user = null;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null;
    }
  }

  const demoCookie = request.cookies.get("demo_mode")?.value;
  const isAuthenticated = Boolean(user || (demoCookie && demoCookie.length > 0));
  const { pathname } = request.nextUrl;

  // 1. If user is signed in / in demo mode and visits /login, redirect to /dashboard
  if (pathname === "/login") {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 2. Protected routes: /dashboard, /group/*, /trust-score
  // Note: /trust/[id] is public and must NOT be protected
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/group") ||
    pathname === "/trust-score" ||
    pathname.startsWith("/trust-score/");

  // Public exceptions check
  const isPublicTrustCard = pathname.startsWith("/trust/") && !pathname.startsWith("/trust-score");

  if (isProtected && !isPublicTrustCard && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

