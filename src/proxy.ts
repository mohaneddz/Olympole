import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if ((pathname.startsWith("/admin") || pathname.startsWith("/profile")) && !data.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, school, year_of_study")
      .eq("id", data.user.id)
      .single();

    const isComplete = Boolean(profile?.full_name && profile?.school && profile?.year_of_study);
    if (!isComplete) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
