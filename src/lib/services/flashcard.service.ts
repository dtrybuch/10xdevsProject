import type { CreateFlashcardCommand, FlashcardDTO } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

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
