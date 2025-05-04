import "../polyfills";
import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

declare global {
  namespace App {
    interface Locals {
      runtime: {
        env: {
          SUPABASE_URL: string;
          SUPABASE_PUBLIC_KEY: string;
        };
      };
    }
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith('/_astro')) {
    // Skip middleware for internal Astro requests
    return next();
  }

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(context.url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
    locals: context.locals
  });

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    context.locals.user = {
      email: user.email ?? null,
      id: user.id,
    };
    context.locals.supabase = supabase;
  } else if (!PUBLIC_PATHS.includes(context.url.pathname)) {
    // Redirect to login for protected routes
    return context.redirect("/login");
  }

  return next();
});
