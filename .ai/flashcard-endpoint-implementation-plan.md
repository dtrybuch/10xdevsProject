# API Endpoint Implementation Plan: Create Flashcard

## 1. Przegląd punktu końcowego

Celem endpointu jest umożliwienie tworzenia nowej fiszki (flashcard) przez użytkowników. Endpoint obsługuje zarówno manualne tworzenie fiszek, jak i akceptację fiszek wygenerowanych przez AI, zgodnie ze specyfikacją.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **URL:** /flashcards
- **Parametry w ciele żądania (Request Body):**
  - **Wymagane:**
    - `front`: String, maksymalnie 200 znaków.
    - `back`: String, maksymalnie 500 znaków.
    - `type`: String, dozwolone wartości: 'AI' lub 'manual'.
  - **Opcjonalne:**
    - `knowledge_status`: String, opcjonalne pole.

## 3. Wykorzystywane typy

- **Command Model:** `CreateFlashcardCommand` (definiowany w `src/types.ts`)
- **DTO:** `FlashcardDTO` do mapowania do bazy danych.
- **Typ dla flashcards:** `Flashcard` do reprezentowania danych z bazy.

## 4. Szczegóły odpowiedzi

- **Sukces:**
  - Status: 201 Created.
  - Treść odpowiedzi: Obiekt JSON zawierający dane utworzonej fiszki.
- **Błędy:**
  - 400 Bad Request: Nieprawidłowe dane wejściowe (np. za długi tekst, brak wymaganych pól).
  - 401 Unauthorized: Użytkownik nie zalogowany lub brak wymaganych uprawnień.
  - 500 Internal Server Error: Błąd serwera lub bazy danych.

## 5. Przepływ danych

1. Klient wysyła żądanie POST z ciałem obiektu JSON zawierającym dane fiszki.
2. W warstwie API następuje:
   - Walidacja danych wejściowych za pomocą schematu zdefiniowanego przy użyciu narzędzi takich jak Zod.
   - Uwierzytelnienie użytkownika przy użyciu Supabase (sprawdzanie tokena/sesji).
3. Po pomyślnej walidacji, dane są mapowane na `CreateFlashcardCommand`.
4. Następuje zapis do bazy danych w tabeli `flashcards`:
   - Dane weryfikowane są względem ograniczeń zdefiniowanych w bazie (np. maksymalna liczba znaków).
5. W przypadku sukcesu, endpoint zwraca status 201 wraz z utworzonym obiektem fiszki.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:** Endpoint powinien korzystać z Supabase Auth, aby upewnić się, że tylko autoryzowani użytkownicy mogą tworzyć fiszki.
- **Walidacja danych:** Niezbędne jest używanie Zod do walidacji struktury i ograniczeń danych wejściowych (np. długość tekstu).
- **Ochrona przed atakami:** Zapewnienie mechanizmów przeciwdziałających atakom typu SQL Injection oraz nadmiernemu obciążeniu endpointu.

## 7. Obsługa błędów

- **Walidacja wejścia:** Użycie walidatorów określonych w schematach. W przypadku nieprawidłowych danych zwracane jest 400 Bad Request z opisem błędu.
- **Błąd uwierzytelnienia:** Brak lub niewłaściwy token skutkuje zwróceniem 401 Unauthorized.
- **Błąd serwera:** Niespodziewane błędy po stronie serwera czy bazy danych skutkują odpowiedzią 500 Internal Server Error.
- **Logowanie błędów:** Opcjonalne rejestrowanie błędów w tabeli `generation_error_logs`, jeżeli endpoint ma obsługiwać logowanie specyficznych błędów generacji.

## 8. Rozważania dotyczące wydajności

- **Asynchroniczność:** Wykorzystanie asynchronicznych operacji przy interakcji z bazą danych.
- **Optymalizacja walidacji:** Minimalizacja narzutów przez efektywne walidatory dla danych wejściowych.
- **Cache i optymalizacja zapytań:** Choć ten endpoint nie zwraca dużych ilości danych, warto zadbać o odpowiednią optymalizację zapytań bazy w celu zachowania wysokiej wydajności przy większej liczbie użytkowników.

## 9. Etapy wdrożenia

1. **Utworzenie endpointu:**

   - Stworzenie nowego pliku w `/src/pages/api/flashcards` spełniającego strukturę Astro.

2. **Walidacja danych wejściowych:**

   - Implementacja walidacji przy użyciu Zod z wykorzystaniem `CreateFlashcardCommand`.
   - Sprawdzenie długości pól `front` i `back`.

3. **Uwierzytelnianie użytkownika:**

   - Zaimplementowanie middleware korzystającego z Supabase Auth dla autoryzacji.

4. **Logika biznesowa:**

   - Wyodrębnienie logiki zapisu fiszki do serwisu w folderze `src/services` (lub utworzenie nowego serwisu, np. `flashcardService`).
   - Obsługa mapowania danych wejściowych na format wymagany przez bazę danych.

5. **Integracja z bazą danych:**

   - Wykonanie zapytania INSERT do tabeli `flashcards` przy użyciu Supabase.
   - Obsługa ograniczeń narzuconych przez schemat bazy danych (np. maksymalna długość tekstu).

6. **Zwracanie odpowiedzi:**

   - W przypadku sukcesu zwrócenie statusu 201 oraz obiektu JSON z utworzoną fiszką.
   - W przypadku błędów, zwrócenie odpowiedniego kodu błędu oraz komunikatu.

7. **Testowanie:**

   - Testy jednostkowe i end-to-end dla endpointu.
   - Walidacja właściwej obsługi wszystkich scenariuszy (sukces, błędne dane, brak autoryzacji).

8. **Dokumentacja i Code Review:**
   - Przygotowanie dokumentacji technicznej endpointu.
   - Przegląd kodu przez zespół oraz wdrożenie ewentualnych poprawek.
