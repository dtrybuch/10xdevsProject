import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { GenerateFlashcardsCommand } from '../../types';
import { createSupabaseServerInstance } from '../../db/supabase.client';
import { GenerationService } from '../../services/generation.service';
import { config } from '../../config/env';

export const prerender = false;

// Input validation schema
const generateFlashcardsSchema = z.object({
  text: z.string()
    .min(1000, 'Text must be at least 1000 characters long')
    .max(10000, 'Text cannot exceed 10,000 characters')
});

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const sessionStart = Date.now();

    // Check if user is authenticated
    if (!locals.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers
    });

    // Initialize the generation service with the Supabase client
    const generationService = new GenerationService(supabase);

    // Extract and validate the request body
    const body = await request.json() as GenerateFlashcardsCommand;
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validationResult.error.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate flashcards using the service
    const result = await generationService.generateFlashcards(validationResult.data.text, locals.user.id);

    // Calculate session duration in seconds
    const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
    
    // Record the generation session with numeric duration
    await generationService.recordGenerationSession(
      locals.user.id,
      sessionDuration
    );

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing generation request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 