import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  let user = null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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

  const isDemo = request.cookies.get("demo_mode")?.value === "true";
  const isAuthenticated = Boolean(user);
  const { pathname } = request.nextUrl;

  // Public routes that anyone can access without a session
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/") ||
    pathname === "/how-scoring-works" ||
    pathname.startsWith("/how-scoring-works/") ||
    pathname === "/simulator" ||
    pathname.startsWith("/simulator/") ||
    (pathname.startsWith("/trust/") && !pathname.startsWith("/trust-score"));

  // If authenticated user visits /, /login, or /signup, redirect to /dashboard
  if (
    isAuthenticated &&
    (pathname === "/" || pathname === "/login" || pathname === "/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If isDemo is true, ALLOW access to /dashboard and /group/* even if no active session
  const isDemoAllowed =
    isDemo &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/group/") ||
      pathname.startsWith("/groups/") ||
      pathname.startsWith("/trust-score") ||
      pathname.startsWith("/receipt/"));

  // If unauthenticated user tries to access a protected route and is not in demo mode, redirect to /login
  if (!isAuthenticated && !isDemoAllowed && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
