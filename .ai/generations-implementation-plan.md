# API Endpoint Implementation Plan: Generate Flashcards candidates via AI

## 1. Przegląd punktu końcowego

Punkt końcowy odpowiada za generowanie kandydatów flashcardów przy użyciu AI. Użytkownik przesyła tekst (do 10 000 znaków), który jest przetwarzany przez zewnętrzny serwis AI (np. Openrouter.ai), aby wygenerować propozycje flashcardów. Propozycje te są następnie zwracane użytkownikowi do dalszej akcji (akceptacja, edycja, odrzucenie).

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** /generations
- **Parametry:**
  - **Wymagane:**
    - `text`: ciąg znaków (maksymalnie 10 000 znaków)
  - **Opcjonalne:** brak
- **Request Body:**
  ```json
  {
    "text": "string (max 10,000 chars)"
  }
  ```

## 3. Wykorzystywane typy

- **Command Model:** `GenerateFlashcardsCommand` (definiowany w types.ts)
- **DTO:** `FlashcardProposalDTO` dla pojedynczej propozycji flashcarda
- **Opcjonalnie:** `GenerationCreateResponseDto` (jeśli odpowiedź zawiera dodatkowe metadane, np. generation_id, generated_count)

## 4. Szczegóły odpowiedzi

- **Struktura odpowiedzi:** JSON zawierający tablicę propozycji flashcardów
- **Kody statusu:**
  - 200 OK – przy pomyślnym przetwarzaniu i zwróceniu danych
  - 400 Bad Request – gdy dane wejściowe są niepoprawne (np. tekst przekracza 10 000 znaków lub jest pusty)
  - 401 Unauthorized – gdy brak lub nieprawidłowy token autoryzacji
  - 500 Internal Server Error – w przypadku błędów serwera lub problemów z komunikacją z serwisem AI

## 5. Przepływ danych

1. Użytkownik wysyła żądanie POST na endpoint `/generations` ze zdefiniowanym polem `text`.
2. Warstwa kontrolera odbiera żądanie i przekazuje je do warstwy serwisowej.
3. Warstwa serwisowa:
   - Waliduje dane wejściowe (sprawdzenie długości tekstu, format, itp.)
   - Komunikuje się z zewnętrznym serwisem AI (np. Openrouter.ai) w celu generowania propozycji flashcardów
   - Mapuje odpowiedź z serwisu AI do obiektów typu `FlashcardProposalDTO`
4. Opcjonalnie: Rejestracja sesji generacji w tabeli `generation_sessions` oraz logowanie ewentualnych błędów w tabeli `generation_error_logs`.
5. Serwer zwraca odpowiedź w formacie JSON do użytkownika.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:** Każde żądanie musi zawierać poprawny Bearer token JWT (Supabase Auth).
- **Walidacja wejścia:** Dokładne sprawdzanie, czy parametr `text` nie przekracza limitu 10 000 znaków.
- **Ochrona przed atakami:** Zastosowanie rate limiting, sanitizacji danych wejściowych oraz bezpiecznej komunikacji z serwisem AI.
- **RLS:** Upewnienie się, że dostęp do danych jest zgodny z politykami bazy danych (row level security) w Supabase.

## 7. Obsługa błędów

- **400 Bad Request:** Zwrot komunikatu o błędzie, jeśli dane wejściowe są niepoprawne (np. tekst pusty lub przekraczający limit znaków).
- **401 Unauthorized:** Zwracane przy braku/niepoprawności tokena autoryzacyjnego.
- **500 Internal Server Error:** Obsługa błędów wynikających z problemów komunikacji z serwisem AI lub błędów serwera.
- **Logowanie błędów:** Zarejestrowanie wszystkich krytycznych błędów w tabeli `generation_error_logs` w celu audytu i późniejszej diagnostyki.

## 8. Rozważania dotyczące wydajności

- **Optymalizacja obciążenia:** Wprowadzenie mechanizmów cache'owania wyników, jeśli to możliwe, oraz rate limiting.
- **Baza danych:** Upewnienie się, że indeksy (np. na `user_id`) są odpowiednio skonfigurowane, aby zoptymalizować zapytania.
- **Skalowalność:** Strukturę serwisu projektować z myślą o skalowaniu, aby móc przetwarzać duże ilości żądań bez opóźnień.

## 9. Etapy wdrożenia

1. Utworzenie endpointu `/generations` w warstwie kontrolera backendu w katalogu `/src/pages/api`.
2. Implementacja walidacji danych wejściowych w oparciu o wymagania (maksymalnie 10 000 znaków, obecność pola `text`).
3. Integracja z zewnętrznym serwisem AI (np. Openrouter.ai) w warstwie serwisowej (stworzenie serwisu np. `GenerationService`);
   - Implementacja klienta komunikacji z API AI. Na etapie developmentu skorzystamy z mocków, zamiast wywoływania serwisu AI.
   - Mapowanie odpowiedzi do struktury `FlashcardProposalDTO`
4. Implementacja rejestracji sesji generacji w tabeli `generation_sessions` oraz logowania błędów w `generation_error_logs`.
5. Implementacja zabezpieczeń:
   - Uwierzytelnianie poprzez Supabase Auth.
6. Dokumentacja endpointu zgodnie z API plan oraz aktualizacja dokumentacji technicznej projektu.
