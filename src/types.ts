/*
 * Typy DTO i Command Model dla aplikacji
 *
 * Źródło danych:
 * - Modele bazy danych: src/db/database.types.ts
 * - Plan API: .ai/api-plan.md
 *
 * Wykorzystujemy mechanizmy TypeScript (Pick, Omit, Partial) do precyzyjnego odwzorowania wymagań API.
 */

import type { Database } from "./db/database.types";

// User type
export interface User {
  id: string;
  email: string;
}

// ===========================
// Flashcards DTO i Command Model
// ===========================
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
// Bezpośrednie mapowanie na bazowy model flashcards
export type FlashcardDTO = Omit<Flashcard, "user_id">;

// Ograniczamy typ flashcard do dwóch dozwolonych wartości
export type FlashcardType = "AI" | "manual";

// Command Model dla tworzenia flashcard
// Bazujemy na typie Insert, ale wykluczamy automatycznie ustawiane pola oraz modyfikujemy pole knowledge_status na opcjonalne.
export interface CreateFlashcardCommand {
  front: string;
  back: string;
  type: FlashcardType;
  knowledge_status?: string;
}

// Command Model dla aktualizacji flashcard
// Pozwala na częściową aktualizację pól, ograniczając się do modyfikowalnych atrybutów.
export interface UpdateFlashcardCommand extends Partial<{
  front: string;
  back: string;
  type: FlashcardType;
  knowledge_status: string;
  last_review_date: string | null;
}> {}

// Command Model dla generowania kandydatów flashcard przez AI
export interface GenerateFlashcardsCommand {
  text: string;
}

//Flashcard proposal DTO
//Represents a single flashcard proiposal generated from AI, always with type 'ai'
export interface FlashcardProposalDTO {
  front: string;
  back: string;
  type: "ai";
  status?: "accepted" | "edited";
}

//Generation create reponse dto
//Represents the response from the generation create endpoint
export interface GenerationCreateResponseDto {
  generation_id: number;
  flashcards_proposal: FlashcardProposalDTO[];
  generated_count: number;
}

// ===========================
// Generation Error Logs DTO
// ===========================

// Bezpośrednie mapowanie na model error logs z bazy danych
export type GenerationErrorLogDTO = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// ===========================
// Generation Sessions DTO i Command Model
// ===========================

// DTO dla sesji generacji, mapujemy na model z bazy danych, ale nadpisujemy typ pola session_duration
export interface GenerationSessionDTO
  extends Omit<Database["public"]["Tables"]["generation_sessions"]["Row"], "session_duration"> {
  session_duration: string; // ISO 8601 duration format
}

// Command Model dla tworzenia/rekordowania sesji
export interface CreateGenerationSessionCommand {
  session_duration: string; // ISO 8601 duration format
  accepted_count?: number;
  edited_count?: number;
  rejected_count?: number;
}

export interface UserStoreState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserLoginForm {
  email: string;
}

export interface UserSessionInfo {
  id: string; // User ID
  email: string; // User email
}
