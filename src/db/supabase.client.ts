import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies; platform?: any }) => {
  // Access environment variables through Cloudflare's platform context
  const env = context.platform?.env ?? import.meta.env;
  
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_PUBLIC_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing Supabase environment variables. Found:
      SUPABASE_URL: ${supabaseUrl ? "defined" : "undefined"}
      SUPABASE_PUBLIC_KEY: ${supabaseKey ? "defined" : "undefined"}
      Platform: ${context.platform ? "available" : "not available"}
      Please check your environment variables configuration.`
    );
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
