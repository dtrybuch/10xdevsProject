import type { CreateFlashcardCommand, FlashcardDTO, UpdateFlashcardCommand } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { PostgrestError } from '@supabase/supabase-js';
import type { Flashcard } from '../../types';

export async function createFlashcard(
  supabase: SupabaseClient<Database>,
  userId: string,
  command: CreateFlashcardCommand
): Promise<FlashcardDTO> {
  const { data, error } = await supabase
    .from("flashcards")
    .insert({
      user_id: userId,
      front: command.front,
      back: command.back,
      type: command.type,
      knowledge_status: command.knowledge_status || "new",
      created_at: new Date().toISOString(),
      last_review_date: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create flashcard: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to create flashcard: No data returned");
  }

  return data;
}

/**
 * Fetches a paginated list of flashcards for a specific user.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user whose flashcards are to be fetched.
 * @param page - The page number for pagination (1-indexed).
 * @param pageSize - The number of flashcards per page.
 * @returns A promise that resolves to an object containing the list of flashcards, an error object (if any), and the total count of matching flashcards.
 */
export async function getUserFlashcards(
  supabase: SupabaseClient,
  userId: string,
  page: number,
  pageSize: number
): Promise<{ data: Flashcard[] | null; error: PostgrestError | null; count: number | null }> {
  const offset = (page - 1) * pageSize;
  // Supabase range is inclusive, so (offset, offset + pageSize - 1)
  const to = offset + pageSize - 1;

  try {
    const { data, error, count } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .range(offset, to);
      // Optional default sorting as per plan, can be uncommented if needed:
      // .order('created_at', { ascending: false });

    return { data, error, count };
  } catch (e) {
    // Catch any unexpected errors during the database query
    console.error('Error fetching user flashcards:', e);
    return {
      data: null,
      // Ensuring the error object matches PostgrestError structure or a generic one
      error: {
        message: 'An unexpected error occurred while fetching flashcards.',
        details: e instanceof Error ? e.message : String(e),
        hint: '',
        code: 'UNEXPECTED_DB_ERROR',
      } as PostgrestError,
      count: null,
    };
  }
}

/**
 * Deletes a flashcard after verifying the user is the owner.
 *
 * @param supabase - The Supabase client instance
 * @param userId - The ID of the user attempting to delete the flashcard
 * @param flashcardId - The ID of the flashcard to delete
 * @returns A promise that resolves to an object indicating success or failure with an optional error message
 */
export async function deleteFlashcard(
  supabase: SupabaseClient<Database>,
  userId: string,
  flashcardId: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Ensure flashcardId is a number
    const numericId = typeof flashcardId === 'string' ? parseInt(flashcardId, 10) : flashcardId;
    
    // Check if flashcard exists and belongs to the user
    const { data: flashcard, error: fetchError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("id", numericId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: "Failed to verify flashcard ownership" };
    }

    if (!flashcard) {
      return { success: false, error: "Flashcard not found or you don't have permission to delete it" };
    }

    // Delete the flashcard
    const { error: deleteError } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", numericId);

    if (deleteError) {
      return { success: false, error: `Failed to delete flashcard: ${deleteError.message}` };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

/**
 * Updates a flashcard after verifying the user is the owner.
 *
 * @param supabase - The Supabase client instance
 * @param userId - The ID of the user attempting to update the flashcard
 * @param flashcardId - The ID of the flashcard to update
 * @param updates - The updated fields for the flashcard
 * @returns A promise that resolves to the updated flashcard or an error
 */
export async function updateFlashcard(
  supabase: SupabaseClient<Database>,
  userId: string,
  flashcardId: string | number,
  updates: UpdateFlashcardCommand
): Promise<{ data: FlashcardDTO | null; error: string | null }> {
  try {
    // Ensure flashcardId is a number
    const numericId = typeof flashcardId === 'string' ? parseInt(flashcardId, 10) : flashcardId;
    
    // Check if flashcard exists and belongs to the user
    const { data: flashcard, error: fetchError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("id", numericId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      return { data: null, error: "Failed to verify flashcard ownership" };
    }

    if (!flashcard) {
      return { data: null, error: "Flashcard not found or you don't have permission to update it" };
    }

    // Update the flashcard
    const { data, error: updateError } = await supabase
      .from("flashcards")
      .update(updates)
      .eq("id", numericId)
      .select()
      .single();

    if (updateError) {
      return { data: null, error: `Failed to update flashcard: ${updateError.message}` };
    }

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}
