import type { FlashcardProposalDTO, GenerationCreateResponseDto } from '../types';
import { supabaseClient, DEFAULT_USER_ID } from '../db/supabase.client';

export class GenerationService {
  private readonly aiServiceUrl: string;
  private readonly aiServiceApiKey: string;

  constructor(aiServiceUrl: string, aiServiceApiKey: string) {
    this.aiServiceUrl = aiServiceUrl;
    this.aiServiceApiKey = aiServiceApiKey;
  }

  /**
   * Generates flashcard proposals from the provided text using AI service
   * @param text - The input text to generate flashcards from (max 10,000 chars)
   * @returns Promise with the generation response containing flashcard proposals
   * @throws Error if the AI service request fails
   */
  async generateFlashcards(text: string): Promise<GenerationCreateResponseDto> {
    try {
      // TODO: Implement actual AI service integration
      // For now, return mock data for development
      const mockProposals: FlashcardProposalDTO[] = [
        {
          front: "What is the capital of France?",
          back: "Paris",
          type: "ai"
        },
        {
          front: "What is the largest planet in our solar system?",
          back: "Jupiter",
          type: "ai"
        }
      ];

      const generation_id = Date.now();

      // Record the generation in the database
      await supabaseClient
        .from('generation_sessions')
        .insert({
          user_id: DEFAULT_USER_ID,
          created_at: new Date().toISOString(),
          session_duration: 0, // Initial duration, will be updated later
          accepted_count: 0,
          edited_count: 0,
          rejected_count: 0
        });

      return {
        generation_id,
        flashcards_proposal: mockProposals,
        generated_count: mockProposals.length
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
      await supabaseClient
        .from('generation_sessions')
        .update({
          session_duration: sessionDuration,
          accepted_count: acceptedCount,
          edited_count: editedCount,
          rejected_count: rejectedCount,
        })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
    } catch (error) {
      console.error('Error recording generation session:', error);
      throw new Error('Failed to record generation session');
    }
  }
} 