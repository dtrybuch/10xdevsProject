import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { CreateFlashcardCommand } from '../../../types';
import { createFlashcard } from '../../../lib/services/flashcard.service';
import { supabaseClient, DEFAULT_USER_ID } from '../../../db/supabase.client';

// Prevent static prerendering as this is a dynamic API route
export const prerender = false;

// Zod schema for request validation
const createFlashcardSchema = z.object({
  front: z.string().max(200, 'Front text cannot exceed 200 characters'),
  back: z.string().max(500, 'Back text cannot exceed 500 characters'),
  type: z.enum(['AI', 'manual'], {
    errorMap: () => ({ message: 'Type must be either "AI" or "manual"' })
  }),
  knowledge_status: z.string().optional()
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Validation error', 
        details: validationResult.error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create flashcard using the service
    const flashcard = await createFlashcard(
      supabaseClient,
      DEFAULT_USER_ID,
      validationResult.data
    );

    // Return success response
    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating flashcard:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 