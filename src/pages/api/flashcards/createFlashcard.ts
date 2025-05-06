import type { APIRoute } from "astro";
import { z } from "zod";
import { createFlashcard } from "../../../lib/services/flashcard.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

// Prevent static prerendering as this is a dynamic API route
export const prerender = false;

// Zod schema for request validation
const createFlashcardSchema = z.object({
  front: z.string().max(200, "Front text cannot exceed 200 characters"),
  back: z.string().max(500, "Back text cannot exceed 500 characters"),
  type: z.enum(["AI", "manual"], {
    errorMap: () => ({ message: 'Type must be either "AI" or "manual"' }),
  }),
  knowledge_status: z.string().optional(),
});

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get user ID from auth context
    if (!locals.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Create flashcard using the service
    const flashcard = await createFlashcard(supabase, locals.user.id, validationResult.data);

    // Return success response
    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
