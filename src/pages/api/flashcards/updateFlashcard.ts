import type { APIRoute } from "astro";
import type { UpdateFlashcardCommand } from "../../../types";
import { updateFlashcard } from "../../../lib/services/flashcard.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { z } from "zod";

export const prerender = false;

// Zod schema for request validation
const updateFlashcardSchema = z.object({
  id: z.number().or(z.string()).transform(val => typeof val === 'string' ? parseInt(val, 10) : val),
  front: z.string().max(200, "Front content exceeds 200 characters").optional(),
  back: z.string().max(500, "Back content exceeds 500 characters").optional(),
  type: z.enum(["AI", "manual"], {
    errorMap: () => ({ message: 'Type must be either "AI" or "manual"' }),
  }).optional(),
  knowledge_status: z.string().optional(),
  last_review_date: z.string().nullable().optional(),
});

export const PUT: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const requestData = await request.json();
    
    // Validate request data using Zod
    const validationResult = updateFlashcardSchema.safeParse(requestData);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Validation error",
          details: validationResult.error.errors
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const validatedData = validationResult.data;
    const { id, ...updateData } = validatedData;

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
    
    // Update flashcard using the service
    const { data, error } = await updateFlashcard(
      supabase,
      locals.user.id,
      id,
      updateData as UpdateFlashcardCommand
    );
    
    if (error) {
      return new Response(
        JSON.stringify({ error }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: "Flashcard updated successfully"
      }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 