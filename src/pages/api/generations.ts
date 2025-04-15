import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from '../../types';
import { supabaseClient, DEFAULT_USER_ID } from '../../db/supabase.client';
import { GenerationService } from '../../services/GenerationService';
import { config } from '../../config/env';

// Input validation schema
const generateFlashcardsSchema = z.object({
  text: z.string()
    .min(1000, 'Text must be at least 1000 characters long')
    .max(10000, 'Text cannot exceed 10,000 characters')
});

// Initialize the generation service
const generationService = new GenerationService(
  config.aiService.url,
  config.aiService.apiKey
);

export const post: APIRoute = async ({ request }) => {
  try {
    const sessionStart = Date.now();

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
    const result = await generationService.generateFlashcards(validationResult.data.text);

    // Calculate session duration in seconds
    const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
    
    // Record the generation session with numeric duration
    await generationService.recordGenerationSession(
      DEFAULT_USER_ID,
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