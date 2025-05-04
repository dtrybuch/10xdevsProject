import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';
import { z } from 'zod';

// Prevent static prerendering
export const prerender = false;

// Validation schema for login request
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string(),
});

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          status: 'error',
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ 
        user: data.user,
        status: 'success',
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: error.errors[0].message,
          status: 'error',
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: `An unexpected error occurred ${error}`,
        status: 'error',
      }),
      { status: 500 }
    );
  }
}; 