# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego
Endpoint umożliwiający usunięcie określonej fiszki na podstawie jej identyfikatora. Endpoint sprawdza, czy użytkownik jest zalogowany oraz czy jest właścicielem fiszki, którą próbuje usunąć.

## 2. Szczegóły żądania
- Metoda HTTP: `DELETE`
- Struktura URL: `/api/flashcards/[id]`
- Parametry:
  - Wymagane: `id` (identyfikator fiszki) - przekazywany jako część ścieżki URL
  - Opcjonalne: brak
- Request Body: brak (DELETE nie wymaga body)

## 3. Wykorzystywane typy
- Istniejące typy:
  - `Flashcard` z `src/types.ts` - używany do walidacji dostępu
  - `SupabaseClient` z `@supabase/supabase-js` - używany do interakcji z bazą danych

## 4. Szczegóły odpowiedzi
- Sukces:
  - Status: 204 No Content
  - Body: brak (zgodnie z praktyką dla metody DELETE)
- Błędy:
  - 401 Unauthorized - gdy użytkownik nie jest zalogowany
  - 403 Forbidden - gdy użytkownik próbuje usunąć fiszkę, która nie należy do niego
  - 404 Not Found - gdy fiszka o podanym ID nie istnieje
  - 500 Internal Server Error - gdy wystąpi nieoczekiwany błąd podczas przetwarzania

## 5. Przepływ danych
1. Odbiór żądania DELETE z identyfikatorem fiszki w URL
2. Walidacja autoryzacji użytkownika
3. Utworzenie instancji klienta Supabase
4. Sprawdzenie czy fiszka istnieje i należy do zalogowanego użytkownika
5. Wywołanie serwisu do usunięcia fiszki
6. Zwrócenie odpowiedniej odpowiedzi

## 6. Względy bezpieczeństwa
- Autoryzacja: Wymagane uwierzytelnienie użytkownika
- Weryfikacja właściciela: Sprawdzenie czy fiszka należy do zalogowanego użytkownika
- Walidacja ID: Zapewnienie, że ID fiszki jest poprawnym identyfikatorem
- Obsługa błędów: Zwracanie generycznych komunikatów błędów, bez ujawniania szczegółów technicznych

## 7. Obsługa błędów
- Nieistnienie fiszki: 404 Not Found z odpowiednim komunikatem
- Brak autoryzacji: 401 Unauthorized
- Brak uprawnień: 403 Forbidden gdy użytkownik próbuje usunąć fiszkę innego użytkownika
- Błędy serwera: 500 Internal Server Error z ogólnym komunikatem

## 8. Rozważania dotyczące wydajności
- Indeksowanie: Upewnienie się, że pole `id` w tabeli `flashcards` jest indeksowane
- Zapytanie: Użycie pojedynczego zapytania do sprawdzenia istnienia i usunięcia fiszki
- Logowanie: Minimalne logowanie informacji dla operacji usuwania

## 9. Etapy wdrożenia
1. Utworzenie nowej funkcji w serwisie flashcard.service.ts:
   ```typescript
   export async function deleteFlashcard(
     supabase: SupabaseClient<Database>,
     userId: string,
     flashcardId: string | number
   ): Promise<{ success: boolean; error?: string }>;
   ```

2. Implementacja funkcji serwisowej:
   ```typescript
   export async function deleteFlashcard(
     supabase: SupabaseClient<Database>,
     userId: string,
     flashcardId: string | number
   ): Promise<{ success: boolean; error?: string }> {
     try {
       // Sprawdź czy fiszka istnieje i należy do użytkownika
       const { data: flashcard, error: fetchError } = await supabase
         .from("flashcards")
         .select("id")
         .eq("id", flashcardId)
         .eq("user_id", userId)
         .maybeSingle();

       if (fetchError) {
         return { success: false, error: "Failed to verify flashcard ownership" };
       }

       if (!flashcard) {
         return { success: false, error: "Flashcard not found or you don't have permission to delete it" };
       }

       // Usuń fiszkę
       const { error: deleteError } = await supabase
         .from("flashcards")
         .delete()
         .eq("id", flashcardId);

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
   ```

3. Utworzenie pliku `src/pages/api/flashcards/[id].ts` z poniższą implementacją:
   ```typescript
   import type { APIRoute } from "astro";
   import { createSupabaseServerInstance } from "../../../db/supabase.client";
   import { deleteFlashcard } from "../../../lib/services/flashcard.service";
   import { z } from "zod";

   // Prevent static prerendering as this is a dynamic API route
   export const prerender = false;

   // Zod schema for validating path parameter
   const idSchema = z.coerce.number().int().positive();

   export const DELETE: APIRoute = async ({ params, locals, cookies, request }) => {
     try {
       // Walidacja ID
       const validationResult = idSchema.safeParse(params.id);

       if (!validationResult.success) {
         return new Response(
           JSON.stringify({
             error: "Invalid flashcard ID",
             details: validationResult.error.errors,
           }),
           {
             status: 400,
             headers: { "Content-Type": "application/json" },
           }
         );
       }

       // Sprawdzenie uwierzytelnienia
       if (!locals.user?.id) {
         return new Response(JSON.stringify({ error: "Unauthorized" }), {
           status: 401,
           headers: { "Content-Type": "application/json" },
         });
       }

       // Utworzenie instancji Supabase
       const supabase = createSupabaseServerInstance({
         cookies,
         headers: request.headers,
       });

       // Wywołanie funkcji serwisowej
       const result = await deleteFlashcard(supabase, locals.user.id, validationResult.data);

       if (!result.success) {
         // Sprawdzenie czy błąd dotyczy nieznalezienia rekordu
         if (result.error && result.error.includes("not found")) {
           return new Response(JSON.stringify({ error: "Flashcard not found" }), {
             status: 404,
             headers: { "Content-Type": "application/json" },
           });
         }

         // Sprawdzenie czy błąd dotyczy braku uprawnień
         if (result.error && result.error.includes("permission")) {
           return new Response(JSON.stringify({ error: "Permission denied" }), {
             status: 403,
             headers: { "Content-Type": "application/json" },
           });
         }

         // Obsługa ogólnego błędu
         return new Response(JSON.stringify({ error: "Failed to delete flashcard" }), {
           status: 500,
           headers: { "Content-Type": "application/json" },
         });
       }

       // Zwróć 204 No Content dla pomyślnego usunięcia
       return new Response(null, {
         status: 204,
       });
     } catch (error) {
       console.error("Error deleting flashcard:", error);
       return new Response(JSON.stringify({ error: "Internal server error" }), {
         status: 500,
         headers: { "Content-Type": "application/json" },
       });
     }
   };
   ```

4. Testy jednostkowe dla nowego serwisu:
   - Test pomyślnego usunięcia fiszki
   - Test przypadku gdy fiszka nie istnieje
   - Test przypadku gdy użytkownik próbuje usunąć fiszkę innego użytkownika
   - Test obsługi błędów bazy danych

5. Testy integracyjne dla endpointu:
   - Test pomyślnego usunięcia fiszki z uwierzytelnionym użytkownikiem
   - Test próby usunięcia przez nieuwierzytelnionego użytkownika (401)
   - Test próby usunięcia nieistniejącej fiszki (404)
   - Test próby usunięcia fiszki należącej do innego użytkownika (403)

6. Dokumentacja API:
   - Aktualizacja dokumentacji API, aby uwzględnić nowy endpoint
   - Dodanie przykładów użycia i odpowiedzi 