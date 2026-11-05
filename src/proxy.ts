import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/server/logger";
import { getPublicEnv } from "@/shared/lib/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { supabaseUrl, supabasePublishableKey } = getPublicEnv();
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    logger.error("Supabase session refresh failed", error);
  }

  const isAuthenticated = Boolean(data?.claims);
  const pathname = request.nextUrl.pathname;
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/recuperar-clave" ||
    pathname === "/auth/callback" ||
    pathname === "/api/health";

  if (isAuthenticated && pathname === "/login") {
    return redirectWithCookies(request, "/", response);
  }

  if (!isAuthenticated && !isPublicRoute) {
    return redirectWithCookies(request, "/login", response);
  }

  return response;
}

function redirectWithCookies(
  request: NextRequest,
  path: string,
  sourceResponse: NextResponse,
) {
  const response = NextResponse.redirect(new URL(path, request.url));
  sourceResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
