import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";

const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

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
            response.cookies.set(cookie.name, cookie.value, {
              ...cookie.options,
              maxAge: NINETY_DAYS_SECONDS,
            });
          }
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isBypassPath =
    pathname.startsWith("/onboarding")
    || pathname.startsWith("/api")
    || pathname.startsWith("/login");

  if ((pathname.startsWith("/admin") || pathname.startsWith("/profile")) && !data.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (data.user && !isBypassPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, school, year_of_study, student_id")
      .eq("id", data.user.id)
      .single();

    const isComplete = Boolean(
      profile?.full_name?.trim()
      && profile?.school?.trim()
      && profile?.year_of_study?.trim()
      && profile?.student_id?.trim()
    );

    if (!isComplete) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  if (pathname.startsWith("/admin") && data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, school, year_of_study, student_id")
      .eq("id", data.user.id)
      .single();

    const isComplete = Boolean(profile?.full_name && profile?.school && profile?.year_of_study && profile?.student_id);
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
