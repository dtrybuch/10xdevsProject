# Plan implementacji widoku Generate Flashcards

## 1. Przegląd
Widok "Generacja fiszek" umożliwia użytkownikowi wklejenie długiego tekstu (od 1000 do 10 000 znaków) oraz wygenerowanie propozycji fiszek przez AI. Użytkownik może przeglądać, akceptować, edytować lub odrzucać wygenerowane propozycje fiszek. Do bazy są zapisywane tylko wysylane fiszki. Celem widoku jest przyspieszenie procesu tworzenia fiszek edukacyjnych, zgodnie z wymaganiami PRD oraz potrzebami użytkowników.

## 2. Routing widoku
Widok powinien być dostępny pod adresem: `/generate`.

## 3. Struktura komponentów
- `GenerateFlashcardsView`: Główny komponent widoku, zawierający logikę walidacji, stan wprowadzanego tekstu, ładowanie oraz zarządzanie wynikami.
  - `TextInputArea`: Komponent do wprowadzania tekstu przez użytkownika.
  - `GenerateButton`: Przycisk inicjujący proces generowania fiszek.
  - `SkeletonLoader`: Wskaźnik ładowania (skeleton) wyświetlany podczas oczekiwania na odpowiedź API.
  - `FlashcardProposalList`: Lista wyświetlająca propozycje fiszek wraz z opcjami akceptacji, edycji i odrzucenia.
    - `FlashcardProposalListItem`: Pojedynczy element listy.
  - `AlertMessage`: Komponent do wyświetlania komunikatów błędów i walidacji.
  - `BulkSaveButton`: Przycisk do zapisywania zaakceptowanych fiszek lub wszystkich.

## 4. Szczegóły komponentów
### GenerateFlashcardsView
- Opis: Główny kontener strony, zarządza logiką widoku, stanem formularza i wynikami z API.
- Główne elementy: Textarea, przycisk "Generuj", wskaźnik ładowania, lista propozycji fiszek, alerty błędów.
- Obsługiwane interakcje:
  - Wpisywanie tekstu (onChange).
  - Kliknięcie przycisku do wywołania API.
  - Przekazywanie zdarzeń akceptacji, edycji i odrzucenia fiszek.
- Walidacja:
  - Tekst musi mieć co najmniej 1000 znaków i nie przekraczać 10 000 znaków.
  - Wyświetlanie komunikatu błędu przy niepoprawnych danych.
- Typy:
  - `GenerationCreateResponseDto` (zawiera: generation_id, flashcards_proposal, generated_count).
  - Dodatkowy ViewModel (`GenerateViewState`) dla zarządzania stanem widoku.
- Propsy: Nie przyjmuje zewnętrznych propsów; zarządza własnym stanem.

### TextInputArea
- Opis: Pole tekstowe do wprowadzania długiego tekstu przez użytkownika.
- Główne elementy: `<textarea>` z informacją o limicie znaków.
- Interakcje: onChange, onBlur (walidacja).
- Walidacja: Sprawdzenie długości tekstu (1000-10 000 znaków).
- Typy: Wewnętrzny typ stanu przechowujący tekst (string).
- Propsy: `value`, `onChange`, `errorMessage`.

### GenerateButton
- Opis: Przycisk inicjujący wywołanie API.
- Elementy: `<button>` z napisem "Generuj".
- Interakcje: onClick.
- Walidacja: Przycisk aktywny jedynie, gdy dane w polu tekstowym są poprawne.
- Propsy: `disabled` (flag), `onClick` handler.

### SkeletonLoader
- Opis: Wskaźnik ładowania, który pojawia się podczas oczekiwania na wyniki z API.
- Elementy: Skeletor.
- Interakcje: Brak bezpośredniej interakcji.
- Propsy: Widoczność (boolean).

### FlashcardProposalList
- Opis: Lista wyświetlająca wygenerowane przez AI propozycje fiszek.
- Główne elementy: Lista elementów z dwoma polami: `front` i `back`.
- Interakcje:
  - Akceptacja fiszki: triggeruje zapis fiszki przez inny endpoint (Create Flashcard).
  - Edycja fiszki: umożliwia modyfikację treści przed akceptacją.
  - Odrzucenie fiszki: usuwa propozycję z listy.
- Walidacja: Sprawdzenie poprawności edytowanych danych zgodnie z ograniczeniami (max 200 dla frontu, max 500 dla backu).
- Typy: `FlashcardProposalDTO` (definicja: front, back, type "ai").
- Propsy: `proposals` (lista), `onAccept`, `onEdit`, `onReject`.

### FlashcardProposalListItem
- Opis: Komponent prezentujący pojedynczą propozycję fiszki.
- Główne elementy: Wyświetlenie treści fiszki (pola `front` i `back`) oraz przyciski/ikony umożliwiające akceptację, edycję i odrzucenie propozycji.
- Interakcje: Obsługa kliknięć przycisków, które wywołują przekazane callbacki (np. `onAccept`, `onEdit`, `onReject`).
- Walidacja: Podczas edycji weryfikacja poprawności danych – `front` nie przekracza 200 znaków, `back` nie przekracza 500 znaków.
- Typy: Powiązany z typem `FlashcardProposalDTO`.
- Propsy: `proposal` (obiekt typu FlashcardProposalDTO), `onAccept` (funkcja callback), `onEdit` (funkcja callback), `onReject` (funkcja callback).

### AlertMessage
- Opis: Komponent do wyświetlania komunikatów o błędach i walidacji.
- Elementy: Komunikat tekstowy z odpowiednim stylem (np. kolor czerwony dla błędów).
- Interakcje: Brak.
- Propsy: `message` (string), `type` (np. error, info).

### BulkSaveButton
- Opis: Przycisk, który umożliwia zapisanie wszystkich zaakceptowanych fiszek w postaci zbiorczego zapytania do endpointu tworzenia fiszek. Używa endpointu `POST /flashcards` zgodnie z typem `CreateFlashcardCommand`, który definiuje strukturę pojedynczej fiszki (front, back, type oraz opcjonalnie knowledge_status).
- Główne elementy: `<button>` z napisem "Zapisz wybrane". Może wyświetlać stan przetwarzania przy użyciu skeletona lub potwierdzenie zapisu.
- Interakcje: onClick - inicjuje funkcję, która zbiera zaakceptowane fiszki i wysyła zapytania API dla każdej z nich.
- Walidacja: Przycisk aktywny tylko wtedy, gdy istnieje przynajmniej jedna zaakceptowana fiszka do zapisania.
- Typy: Powiązany typ to `CreateFlashcardCommand` (definicja: front, back, type, knowledge_status?).
- Propsy: `selectedProposals` (lista zaakceptowanych fiszek), `onBulkSaveComplete` (callback po zakończeniu operacji), oraz opcjonalny `isLoading` (boolean).

## 5. Typy
- `GenerationCreateResponseDto`:
  - `generation_id: number`
  - `flashcards_proposal: FlashcardProposalDTO[]`
  - `generated_count: number`
- `FlashcardProposalDTO`:
  - `front: string`
  - `back: string`
  - `type: "ai"`
- `GenerateViewState` (ViewModel lokalny dla widoku):
  - `inputText: string`
  - `isLoading: boolean`
  - `error: string | null`
  - `proposals: FlashcardProposalDTO[]`

## 6. Zarządzanie stanem
- Użycie hooków `useState` do zarządzania stanem inputu, ładowaniem, błędami i propozycjami.
- Możliwe utworzenie custom hooka `useGenerateFlashcards` do enkapsulacji logiki wywołania API i aktualizacji stanu.

## 7. Integracja API
- Endpoint do generacji fiszek: `POST /generations`
  - Żądanie: `{ "text": "..." }`
  - Odpowiedź: `GenerationCreateResponseDto`
- Endpoint do tworzenia fiszki: `POST /flashcards`
  - Żądanie: `{ front, back, type, knowledge_status? }`
- Bulk save: Dla każdej zaakceptowanej fiszki, wywołujemy endpoint `POST /flashcards` z danymi zgodnymi z `CreateFlashcardCommand` w celu zbiorczego zapisu.
- Walidacja odpowiedzi: Sprawdzenie statusu odpowiedzi, odpowiednia obsługa błędów (400, 500).
- Implementacja przy użyciu funkcji `fetch` lub biblioteki (np. axios) zgodnie z typami zdefiniowanymi w `types.ts`.

## 8. Interakcje użytkownika
- Użytkownik wprowadza tekst w polu tekstowym – walidacja długości w czasie rzeczywistym.
- Po kliknięciu przycisku "Generuj", widok przechodzi w stan ładowania (LoadingSpinner) i wykonywane jest wywołanie API.
- Po otrzymaniu danych, lista propozycji fiszek jest wyświetlana.
- Użytkownik może zaakceptować, edytować lub odrzucić każdą propozycję.
- Akceptacja propozycji wywołuje kolejny request do endpointu `/flashcards` przy akceptacji.

## 9. Warunki i walidacja
- Tekst wejściowy musi mieć długość między 1000 a 10 000 znaków.
- Przycisk "Generuj" jest aktywny tylko przy poprawnych danych.
- Walidacja edycji fiszek:
  - `front`: max 200 znaków.
  - `back`: max 500 znaków.
- W przypadku błędów walidacji lub problemów serwerowych, użytkownik otrzyma komunikat błędu za pomocą komponentu AlertMessage.

## 10. Obsługa błędów
- Błędy walidacji są wyświetlane lokalnie.
- Błędy wynikające z odpowiedzi API (np. 400 lub 500) skutkują wyświetleniem komunikatu w komponencie AlertMessage.
- Mechanizm retry dla krytycznych błędów lub informacja o konieczności ponowienia akcji.

## 11. Kroki implementacji
1. Utworzenie struktury widoku: stworzenie nowej strony `/generate` wykorzystując Astro.
2. Implementacja głównego komponentu `GenerateFlashcardsView` z podziałem na komponenty podrzędne.
3. Dodanie pola tekstowego (TextInputArea) z walidacją długości wpisanego tekstu.
4. Implementacja przycisku "Generuj" (GenerateButton) i powiązanie go z funkcją wywołania API.
5. Dodanie LoadingSpinner, który pojawia się podczas oczekiwania na odpowiedź z API.
6. Implementacja integracji API do endpointu `/generations` przy użyciu `fetch` (z odpowiednim typowaniem).
7. Przetwarzanie i wyświetlanie wyników w komponencie `FlashcardProposalList`.
8. Dodanie funkcjonalności akceptacji, edycji i odrzucenia propozycji fiszek, wraz z wywołaniem endpointu `/flashcards` przy akceptacji.
9. Testowanie interakcji, walidacji oraz obsługi błędów.
10. Dokumentacja kodu i przygotowanie komponentów do ewentualnych modyfikacji. 