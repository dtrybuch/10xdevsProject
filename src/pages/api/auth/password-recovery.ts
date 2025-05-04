import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email format"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });
    const body = await request.json();
    console.log(body);
    const { email } = schema.parse(body);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
      captchaToken: undefined,
    });

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to send reset password email" }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Password reset email sent successfully" }), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
