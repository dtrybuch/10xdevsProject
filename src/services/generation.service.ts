import type { FlashcardProposalDTO, GenerationCreateResponseDto } from '../types';
import { supabaseClient, DEFAULT_USER_ID } from '../db/supabase.client';
import { OpenRouterService } from '../lib/openrouter.service';

export class GenerationService {
  private readonly openRouterService: OpenRouterService;

  constructor() {
    if (!import.meta.env.OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your .env file.');
    }

    this.openRouterService = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      modelName: 'openai/gpt-4o-mini',
      modelParameters: {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    });
  }

  /**
   * Generates flashcard proposals from the provided text using AI service
   * @param text - The input text to generate flashcards from (max 10,000 chars)
   * @returns Promise with the generation response containing flashcard proposals
   * @throws Error if the AI service request fails
   */
  async generateFlashcards(text: string): Promise<GenerationCreateResponseDto> {
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
      const flashcardsProposal: FlashcardProposalDTO[] = aiResponse.answer.map(card => ({
        front: card.front,
        back: card.back,
        type: 'ai'
      }));

      const generation_id = Date.now();

      // Create initial session record
      const { error: insertError } = await supabaseClient
        .from('generation_sessions')
        .insert({
          user_id: DEFAULT_USER_ID,
          session_duration: 'PT0S',  // Initial duration as ISO 8601
          accepted_count: 0,
          edited_count: 0,
          rejected_count: 0
        });

      if (insertError) {
        console.error('Error creating generation session:', insertError);
        throw new Error('Failed to create generation session');
      }

      return {
        generation_id,
        flashcards_proposal: flashcardsProposal,
        generated_count: flashcardsProposal.length
      };
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw new Error('Failed to generate flashcards');
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
    acceptedCount: number = 0,
    editedCount: number = 0,
    rejectedCount: number = 0
  ): Promise<void> {
    try {
      // Convert seconds to ISO 8601 duration format
      const duration = `PT${sessionDuration}S`;
      
      const { error: updateError } = await supabaseClient
        .from('generation_sessions')
        .update({
          session_duration: duration,
          accepted_count: acceptedCount,
          edited_count: editedCount,
          rejected_count: rejectedCount,
        })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (updateError) {
        console.error('Error updating generation session:', updateError);
        throw new Error('Failed to update generation session');
      }
    } catch (error) {
      console.error('Error recording generation session:', error);
      throw new Error('Failed to record generation session');
    }
  }
} 