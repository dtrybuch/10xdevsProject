import type { FlashcardProposalDTO, GenerationCreateResponseDto } from "../types";
import { type SupabaseClient } from "@supabase/supabase-js";
import { OpenRouterService } from "../lib/openrouter.service";
import type { Database } from "../db/database.types";

export class GenerationService {
  private readonly openRouterService: OpenRouterService;
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    // Try to get API key from various sources
    const apiKey = process.env.OPENROUTER_API_KEY || 
                   import.meta.env.OPENROUTER_API_KEY || 
                   import.meta.env.PUBLIC_OPENROUTER_API_KEY;
                   
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not found. Available env vars:", 
        Object.keys(process.env || {}).join(", "), 
        Object.keys(import.meta.env || {}).join(", "));
      throw new Error("OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your .env file.");
    }

    this.supabase = supabase;
    this.openRouterService = new OpenRouterService({
      apiKey,
      modelName: "openai/gpt-4o-mini",
      modelParameters: {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
    });
  }

  /**
   * Generates flashcard proposals from the provided text using AI service
   * @param text - The input text to generate flashcards from (max 10,000 chars)
   * @param userId - The ID of the user generating the flashcards
   * @returns Promise with the generation response containing flashcard proposals
   * @throws Error if the AI service request fails
   */
  async generateFlashcards(text: string, userId: string): Promise<GenerationCreateResponseDto> {
    try {
      const systemPrompt = `You are a flashcard generation assistant. Your task is to create educational flashcards from the provided text.
Each flashcard should have a question on the front and an answer on the back. Follow these rules:
1. Create concise, focused questions that test understanding
2. Ensure answers are clear and accurate
3. Cover key concepts and important details
4. Avoid overly complex or compound questions
5. Make questions specific and unambiguous

You MUST respond with a JSON object in this exact format:
{
  "answer": [
    {
      "front": "question text here",
      "back": "answer text here"
    }
    // ... more flashcards
  ],
  "confidence": 0.9  // number between 0 and 1 indicating confidence in the generated flashcards
}`;

      const userPrompt = `Please create flashcards from the following text:\n\n${text}`;

      const aiResponse = await this.openRouterService.sendChatMessage(systemPrompt, userPrompt);

      // Convert the AI response directly to FlashcardProposalDTO array
      const flashcardsProposal: FlashcardProposalDTO[] = aiResponse.answer.map((card) => ({
        front: card.front,
        back: card.back,
        type: "ai",
      }));

      const generation_id = Date.now();

      // Create initial session record
      const { error: insertError } = await this.supabase.from("generation_sessions").insert({
        user_id: userId,
        session_duration: "PT0S", // Initial duration as ISO 8601
        accepted_count: 0,
        edited_count: 0,
        rejected_count: 0,
      });

      if (insertError) {
        console.error("Error creating generation session:", insertError);
        throw new Error("Failed to create generation session");
      }

      return {
        generation_id,
        flashcards_proposal: flashcardsProposal,
        generated_count: flashcardsProposal.length,
      };
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw new Error("Failed to generate flashcards");
    }
  }

  /**
   * Records the generation session details in the database
   * @param userId - The ID of the user who initiated the generation
   * @param sessionDuration - Duration in seconds
   */
  async recordGenerationSession(
    userId: string,
    sessionDuration: number,
    acceptedCount = 0,
    editedCount = 0,
    rejectedCount = 0
  ): Promise<void> {
    try {
      // Convert seconds to ISO 8601 duration format
      const duration = `PT${sessionDuration}S`;

      const { error: updateError } = await this.supabase
        .from("generation_sessions")
        .update({
          session_duration: duration,
          accepted_count: acceptedCount,
          edited_count: editedCount,
          rejected_count: rejectedCount,
        })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (updateError) {
        console.error("Error updating generation session:", updateError);
        throw new Error("Failed to update generation session");
      }
    } catch (error) {
      console.error("Error recording generation session:", error);
      throw new Error("Failed to record generation session");
    }
  }
}
