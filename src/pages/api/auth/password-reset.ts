import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });

    // Get the access token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization token" }), { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];

    // Set the session using the access token
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: "",
    });

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Invalid or expired reset token" }), { status: 401 });
    }

    const body = await request.json();
    const { password } = schema.parse(body);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to reset password" }), { status: 400 });
    }

    // Clear the session after password reset
    await supabase.auth.signOut();

    return new Response(JSON.stringify({ message: "Password reset successfully" }), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors[0].message }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
