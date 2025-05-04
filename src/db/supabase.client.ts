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

type CloudflareRuntime = {
  env: {
    SUPABASE_URL: string;
    SUPABASE_PUBLIC_KEY: string;
  };
};

export const createSupabaseServerInstance = (context: { 
  headers: Headers; 
  cookies: AstroCookies; 
  locals?: App.Locals;
  cf?: any;
  cloudflare?: CloudflareRuntime;
}) => {
  // Try to get environment variables from different possible sources
  const supabaseUrl = 
    context.cloudflare?.env?.SUPABASE_URL ?? 
    context.locals?.runtime?.env?.SUPABASE_URL ?? 
    import.meta.env.SUPABASE_URL;
    
  const supabaseKey = 
    context.cloudflare?.env?.SUPABASE_PUBLIC_KEY ?? 
    context.locals?.runtime?.env?.SUPABASE_PUBLIC_KEY ?? 
    import.meta.env.SUPABASE_PUBLIC_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing Supabase environment variables. Found:
      SUPABASE_URL: ${supabaseUrl ? "defined" : "undefined"}
      SUPABASE_PUBLIC_KEY: ${supabaseKey ? "defined" : "undefined"}
      Locals Available: ${context.locals ? "yes" : "no"}
      Cloudflare Runtime: ${context.cloudflare ? "yes" : "no"}
      CF: ${context.cf ? "yes" : "no"}
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
