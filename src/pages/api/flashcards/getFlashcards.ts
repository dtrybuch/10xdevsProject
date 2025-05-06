import { z } from 'zod';
import type { APIContext, APIRoute } from 'astro';
import { getUserFlashcards } from '../../../lib/services/flashcard.service';
import type { Flashcard, FlashcardDTO } from '../../../types';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

// Mock data for demonstration purposes
const mockFlashcards: FlashcardDTO[] = [
  {
    id: 1,
    front: "What is TypeScript?",
    back: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
    type: "manual",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    knowledge_status: "new",
    last_review_date: null
  },
  {
    id: 2,
    front: "What is React?",
    back: "React is a JavaScript library for building user interfaces, particularly single-page applications.",
    type: "manual",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    knowledge_status: "learning",
    last_review_date: null
  },
  {
    id: 3,
    front: "What is Astro?",
    back: "Astro is a web framework for building fast, content-focused websites with any UI framework.",
    type: "AI",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    knowledge_status: "known",
    last_review_date: new Date().toISOString()
  }
];

export const prerender = false;

export const GetFlashcardsQuerySchema = z.object({
  page: z.preprocess(
    (val) => (typeof val === 'string' && val.length > 0 ? parseInt(val, 10) : undefined),
    z.number().int().positive().optional().default(1)
  ),
  pageSize: z.preprocess(
    (val) => (typeof val === 'string' && val.length > 0 ? parseInt(val, 10) : undefined),
    z.number().int().positive().max(100).optional().default(10)
  ),
});

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // 1. Authentication
    if (!locals.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const userId = locals.user.id;
    
    // Pobierz klienta Supabase z kontekstu
    const supabase = locals.supabase;

    // 2. Parse and Validate Query Parameters
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get('page'),
      pageSize: url.searchParams.get('pageSize'),
    };

    const validationResult = GetFlashcardsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validationResult.error.formErrors.fieldErrors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { page, pageSize } = validationResult.data;

    // Validate query parameters
    if (isNaN(page) || page < 1) {
      return new Response(
        JSON.stringify({ error: "Invalid page parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid pageSize parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // 3. Call FlashcardService
    const { data: flashcards, error: serviceError, count } = await getUserFlashcards(
      supabase,
      userId,
      page,
      pageSize
    );

    if (serviceError) {
      console.error('Error from flashcard service:', serviceError);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!flashcards) {
      // Should not happen if serviceError is null, but good for type safety
      return new Response(JSON.stringify({ error: 'Internal Server Error - No data from service' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 4. Map to DTO and Respond
    const flashcardDTOs: FlashcardDTO[] = flashcards.map((flashcard: Flashcard) => {
      const { user_id, ...dto } = flashcard;
      return dto;
    });

    // Calculate pagination metadata
    const totalItems = count;
    const currentPage = page;

    return new Response(
      JSON.stringify({
        flashcards: flashcardDTOs,
        totalItems,
        currentPage,
        pageSize
      }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/flashcards/getFlashcards:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 