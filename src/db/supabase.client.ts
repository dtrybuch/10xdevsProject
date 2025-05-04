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

export const createSupabaseServerInstance = (context: { 
  headers: Headers; 
  cookies: AstroCookies; 
  locals?: App.Locals;
}) => {
  // Get environment variables from runtime config
  const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLIC_KEY ?? import.meta.env.SUPABASE_PUBLIC_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Environment context:', {
      processEnvUrl: process.env.SUPABASE_URL ? 'defined' : 'undefined',
      processEnvKey: process.env.SUPABASE_PUBLIC_KEY ? 'defined' : 'undefined',
      importMetaUrl: import.meta.env.SUPABASE_URL ? 'defined' : 'undefined',
      importMetaKey: import.meta.env.SUPABASE_PUBLIC_KEY ? 'defined' : 'undefined'
    });

    throw new Error(
      `Missing Supabase environment variables. Found:
      SUPABASE_URL: ${supabaseUrl ? "defined" : "undefined"}
      SUPABASE_PUBLIC_KEY: ${supabaseKey ? "defined" : "undefined"}
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
