# Plan Implementacji Punktu Końcowego API: List Flashcards

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom pobierania listy ich fiszek. Punkt końcowy wspiera paginację, aby efektywnie zarządzać dużymi zbiorami danych. Opcjonalnie, w przyszłości, może zostać rozszerzony o funkcje filtrowania i sortowania.

## 2. Szczegóły żądania
-   **Metoda HTTP:** `GET`
-   **Struktura URL:** `/api/flashcards` (zgodnie ze strukturą projektu Astro `./src/pages/api`)
-   **Parametry Query:**
    -   Wymagane: Brak
    -   Opcjonalne:
        -   `page` (liczba całkowita, dodatnia): Numer strony dla paginacji. Domyślnie: 1.
        -   `pageSize` (liczba całkowita, dodatnia): Liczba fiszek na stronie. Domyślnie: 10. Maksymalnie: 100.
-   **Request Body:** Brak (dla metody `GET`).

## 3. Wykorzystywane typy
-   **DTO (Data Transfer Object):**
    -   `FlashcardDTO` (z `src/types.ts`): Reprezentuje pojedynczą fiszkę w odpowiedzi. Zdefiniowany jako `Omit<Flashcard, "user_id">`.
    -   `Flashcard` (z `src/types.ts`): Podstawowy typ fiszki z bazy danych (`Database["public"]["Tables"]["flashcards"]["Row"]`).
-   **Schemat Walidacji Zod (dla parametrów query):**
    ```typescript
    // src/pages/api/flashcards.ts
    import { z } from 'zod';

    const GetFlashcardsQuerySchema = z.object({
      page: z.preprocess(
        (val) => (typeof val === 'string' ? parseInt(val, 10) : undefined),
        z.number().int().positive().optional().default(1)
      ),
      pageSize: z.preprocess(
        (val) => (typeof val === 'string' ? parseInt(val, 10) : undefined),
        z.number().int().positive().max(100).optional().default(10)
      ),
    });
    ```

## 4. Szczegóły odpowiedzi
-   **Sukces (200 OK):**
    -   Typ zawartości: `application/json`
    -   Struktura: Tablica obiektów `FlashcardDTO`.
        ```json
        [
          {
            "id": 1,
            "front": "Pytanie 1",
            "back": "Odpowiedź 1",
            "type": "manual",
            "knowledge_status": "new",
            "last_review_date": null,
            "created_at": "2023-10-26T10:00:00Z",
            "updated_at": "2023-10-26T10:00:00Z"
          },
          // ... więcej fiszek
        ]
        ```
        *Uwaga: Aby umożliwić klientowi budowanie interfejsu paginacji, rozważenie zwracania obiektu z metadanymi paginacji (np. `{ data: FlashcardDTO[], totalCount: number, currentPage: number, pageSize: number }`) może być korzystne w przyszłości. Na razie, zgodnie ze specyfikacją, zwracana jest bezpośrednio tablica fiszek.*

-   **Błędy:**
    -   `400 Bad Request`: Nieprawidłowe parametry `page` lub `pageSize`.
    -   `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
    -   `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  Żądanie `GET` przychodzi na endpoint `/api/flashcards` z opcjonalnymi parametrami `page` i `pageSize`.
2.  Middleware Astro (lub logika w handlerze) weryfikuje sesję użytkownika (np. poprzez `Astro.locals.session`). Jeśli użytkownik nie jest uwierzytelniony, zwracany jest błąd 401.
3.  Parametry `page` i `pageSize` są walidowane przy użyciu schematu Zod (`GetFlashcardsQuerySchema`). W przypadku niepowodzenia walidacji, zwracany jest błąd 400.
4.  Handler endpointu pobiera ID użytkownika z `Astro.locals.session.user.id` oraz klienta Supabase z `Astro.locals.supabase`.
5.  Wywoływana jest metoda serwisu `FlashcardService.getUserFlashcards(supabase, userId, page, pageSize)`.
6.  `FlashcardService` konstruuje zapytanie do bazy Supabase (PostgreSQL):
    -   Wybiera fiszki z tabeli `flashcards`.
    -   Filtruje wyniki na podstawie `user_id` (RLS w Supabase dodatkowo to zabezpiecza).
    -   Stosuje paginację (oblicza `offset` i `limit` na podstawie `page` i `pageSize`).
    -   Opcjonalnie: pobiera całkowitą liczbę pasujących fiszek (dla przyszłych rozszerzeń paginacji).
7.  Serwis zwraca listę fiszek (lub błąd, jeśli wystąpił).
8.  Handler endpointu mapuje wyniki na `FlashcardDTO[]` (jeśli konieczne, ale `FlashcardDTO` jest zaprojektowany do bezpośredniego użytku z danymi z bazy po odjęciu `user_id`).
9.  Endpoint zwraca odpowiedź JSON z kodem statusu 200 OK (lista fiszek) lub odpowiedni kod błędu.

## 6. Względy bezpieczeństwa
-   **Uwierzytelnianie:** Obowiązkowe. Endpoint musi być dostępny tylko dla zalogowanych użytkowników. Realizowane przez integrację z Supabase Auth i sprawdzanie sesji w Astro (`Astro.locals.session`).
-   **Autoryzacja:** Użytkownicy mogą pobierać tylko własne fiszki. Zapewnione przez:
    -   Filtrowanie zapytań SQL po `user_id` w serwisie.
    -   Polityki RLS (Row Level Security) w bazie Supabase na tabeli `flashcards`, które ograniczają dostęp do wierszy na podstawie `auth.uid()`.
-   **Walidacja danych wejściowych:** Parametry `page` i `pageSize` muszą być walidowane (typ, zakres) za pomocą Zod, aby zapobiec błędom i potencjalnym atakom (np. żądanie zbyt dużej ilości danych). Maksymalny `pageSize` (np. 100) powinien być narzucony.
-   **Ochrona przed nadużyciami:** Rozważyć rate limiting, jeśli endpoint będzie publicznie dostępny lub intensywnie używany.
-   **Minimalizacja danych:** Odpowiedź zawiera tylko niezbędne pola fiszki (`FlashcardDTO` pomija `user_id`).

## 7. Obsługa błędów
-   **200 OK:** Żądanie przetworzone pomyślnie.
-   **400 Bad Request:**
    -   Przyczyna: Nieprawidłowe parametry `page` lub `pageSize` (np. typ, wartość poza zakresem).
    -   Odpowiedź: JSON z komunikatem błędu z Zod.
      ```json
      {
        "error": "Validation failed",
        "details": [ /* ... szczegóły błędów walidacji ... */ ]
      }
      ```
-   **401 Unauthorized:**
    -   Przyczyna: Brak lub nieprawidłowy token sesji; użytkownik nie jest zalogowany.
    -   Odpowiedź: JSON z komunikatem błędu.
      ```json
      {
        "error": "Unauthorized"
      }
      ```
-   **500 Internal Server Error:**
    -   Przyczyna: Błędy po stronie serwera, np. problem z połączeniem z bazą danych, nieoczekiwany wyjątek w kodzie.
    -   Odpowiedź: JSON z ogólnym komunikatem błędu.
      ```json
      {
        "error": "Internal Server Error"
      }
      ```
    -   Logowanie: Błędy serwera powinny być logowane po stronie serwera (np. konsola, system logów hostingu) w celu diagnozy.

## 8. Rozważania dotyczące wydajności
-   **Paginacja:** Kluczowa dla wydajności przy dużej liczbie fiszek. Zapewnia, że pobierane i przesyłane są tylko niezbędne dane.
-   **Indeksy bazodanowe:** Upewnić się, że kolumna `user_id` w tabeli `flashcards` jest zaindeksowana (zgodnie z `.ai/db-plan.md`). Indeksy na `created_at` lub `updated_at` mogą być przydatne, jeśli zostanie dodane sortowanie po tych polach.
-   **Zapytania do bazy danych:** Optymalizować zapytania SQL/Supabase, aby były jak najszybsze. Unikać pobierania niepotrzebnych kolumn.
-   **Maksymalny `pageSize`:** Ograniczenie `pageSize` (np. do 100) zapobiega nadmiernemu obciążeniu serwera i bazy danych.
-   **Caching:** Na tym etapie nie jest wymagany, ale w przyszłości można rozważyć cachowanie na poziomie HTTP lub serwera dla często odpytywanych danych, jeśli zajdzie taka potrzeba.

## 9. Etapy wdrożenia
1.  **Przygotowanie środowiska:**
    -   Upewnić się, że projekt Astro jest skonfigurowany do obsługi API routes w `src/pages/api`.
    -   Potwierdzić konfigurację Supabase (klient Supabase dostępny w `Astro.locals.supabase`, sesja użytkownika w `Astro.locals.session`).

2.  **Definicja typów i schematów walidacji:**
    -   Zweryfikować/użyć istniejący `FlashcardDTO` w `src/types.ts`.
    -   Utworzyć schemat Zod `GetFlashcardsQuerySchema` dla parametrów `page` i `pageSize` (zgodnie z sekcją 3 tego planu).

3.  **Implementacja serwisu `FlashcardService`:**
    -   Utworzyć plik `src/lib/services/flashcardService.ts`.
    -   Zaimplementować metodę `async getUserFlashcards(supabase: SupabaseClient, userId: string, page: number, pageSize: number): Promise<{ data: Flashcard[]; error: PostgrestError | null; count: number | null }>`:
        -   Przyjmować klienta Supabase, ID użytkownika oraz parametry paginacji.
        -   Obliczyć `offset = (page - 1) * pageSize` i `limit = pageSize -1` (Supabase range jest inclusive, więc `from` do `to`).
        -   Wykonać zapytanie do Supabase:
            ```typescript
            const { data, error, count } = await supabase
              .from('flashcards')
              .select('*', { count: 'exact' }) // Pobierz też całkowitą liczbę
              .eq('user_id', userId)
              .range(offset, offset + pageSize - 1)
              // .order('created_at', { ascending: false }); // Opcjonalne domyślne sortowanie
            ```
        -   Zwrócić `{ data, error, count }`.

4.  **Implementacja endpointu API:**
    -   Utworzyć plik `src/pages/api/flashcards.ts`.
    -   Dodać `export const prerender = false;`
    -   Zaimplementować handler `GET` (np. `export async function GET({ request, locals }: APIContext)`):
        -   Sprawdzić sesję użytkownika (`locals.session`). Jeśli brak, zwrócić 401.
        -   Pobrać `userId` i `supabase` z `locals`.
        -    sparsować parametry query (`URLSearchParams(request.url.search)`).
        -   Zwalidować parametry `page` i `pageSize` używając `GetFlashcardsQuerySchema.safeParse()`. W przypadku błędu, zwrócić 400 z detalami.
        -   Wywołać `flashcardService.getUserFlashcards()` z poprawnymi parametrami.
        -   Jeśli serwis zwróci błąd, zalogować go i zwrócić 500.
        -   Jeśli sukces, przekształcić dane na `FlashcardDTO[]` (pomijając `user_id` z każdego obiektu `Flashcard` jeśli serwis zwraca pełny obiekt `Flashcard`). Supabase `.select()` bez `user_id` lub mapowanie po stronie serwisu/endpointu.
        -   Zwrócić dane jako JSON z kodem 200.

5.  **Testowanie:**
    -   **Testy jednostkowe (Vitest):**
        -   Dla serwisu `FlashcardService` (mockując klienta Supabase).
        -   Dla logiki walidacji Zod.
    -   **Testy integracyjne/E2E (Playwright/MSW):**
        -   Testować endpoint z różnymi parametrami `page` i `pageSize`.
        -   Testować przypadki nieautoryzowanego dostępu.
        -   Testować przypadki błędnych parametrów.
        -   Sprawdzić poprawność struktury odpowiedzi i danych.

6.  **Dokumentacja:**
    -   Zaktualizować dokumentację API (np. Swagger/OpenAPI), jeśli istnieje.
    -   Upewnić się, że komentarze w kodzie są jasne.

7.  **Code Review:**
    -   Przeprowadzić przegląd kodu pod kątem zgodności z planem, jakości kodu, bezpieczeństwa i wydajności.

8.  **Wdrożenie:**
    -   Wdrożyć zmiany na odpowiednie środowisko. 