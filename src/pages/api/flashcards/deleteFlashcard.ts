import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { deleteFlashcard } from "../../../lib/services/flashcard.service";
import { z } from "zod";

// Prevent static prerendering as this is a dynamic API route
export const prerender = false;

// Zod schema for validating query parameter
const idSchema = z.coerce.number().int().positive();

export const DELETE: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "", 10);

    // Validate the ID parameter
    if (isNaN(id) || id < 1) {
      return new Response(
        JSON.stringify({ error: "Invalid flashcard ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check authentication
    if (!locals.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create Supabase instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
      locals
    });

    // Call service function
    const result = await deleteFlashcard(supabase, locals.user.id, id);

    if (!result.success) {
      // Check if error is about not finding the record
      if (result.error && result.error.includes("not found")) {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Check if error is about permissions
      if (result.error && result.error.includes("permission")) {
        return new Response(JSON.stringify({ error: "Permission denied" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle general error
      return new Response(JSON.stringify({ error: "Failed to delete flashcard" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return 204 No Content for successful deletion
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 