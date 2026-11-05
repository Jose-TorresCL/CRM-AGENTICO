import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/server/auth/supabase";
import { logger } from "@/server/logger";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = request.nextUrl.searchParams.get("next");

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error("Supabase auth callback failed", error);
      return NextResponse.redirect(new URL("/login?error=callback", request.url));
    }
  }

  const destination =
    nextPath === "/recuperar-clave?mode=update"
      ? new URL(nextPath, request.url)
      : new URL("/", request.url);

  return NextResponse.redirect(destination);
}
