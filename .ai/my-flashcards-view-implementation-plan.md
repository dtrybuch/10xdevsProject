# Plan implementacji widoku "Moje fiszki"

## 1. Przegląd
Widok "Moje fiszki" umożliwia użytkownikowi przeglądanie, edycję i usuwanie swoich fiszek edukacyjnych. Jest to centralny element aplikacji Fiszki AI, gdzie użytkownik może zarządzać wszystkimi swoimi materiałami edukacyjnymi.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/flashcards` zgodnie z opisem w dokumentacji.

## 3. Struktura komponentów
```
FlashcardsPage.astro (główny komponent widoku)
├── FlashcardsList.tsx (interaktywna lista fiszek)
│   ├── FlashcardItem.tsx (pojedyncza fiszka z opcjami)
│   ├── EditFlashcardDialog.tsx (dialog do edycji)
│   ├── DeleteFlashcardDialog.tsx (dialog potwierdzenia usunięcia)
│   └── Pagination.tsx (paginacja listy)
└── EmptyState.tsx (stan gdy brak fiszek)
```

## 4. Szczegóły komponentów
### FlashcardsPage.astro
- Opis komponentu: Główny komponent Astro zawierający stronę z listą fiszek użytkownika.
- Główne elementy: Nagłówek strony, kontener dla listy fiszek, przekazanie danych użytkownika do komponentu React.
- Obsługiwane interakcje: Brak bezpośrednich (przekazuje sterowanie do FlashcardsList).
- Obsługiwana walidacja: Sprawdzenie, czy użytkownik jest zalogowany.
- Typy: Brak specyficznych.
- Propsy: Brak specyficznych.

### FlashcardsList.tsx
- Opis komponentu: Komponent React wyświetlający listę fiszek z możliwością paginacji.
- Główne elementy: Tabela lub siatka fiszek, przyciski paginacji, komunikat stanu pustej listy.
- Obsługiwane interakcje: Paginacja, sortowanie, filtrowanie, inicjowanie edycji lub usunięcia.
- Obsługiwana walidacja: Sprawdzenie poprawności danych zwróconych z API.
- Typy: `FlashcardDTO[]`, `FlashcardsListViewModel`.
- Propsy: `initialPage` (opcjonalnie), `initialPageSize` (opcjonalnie).

### FlashcardItem.tsx
- Opis komponentu: Komponent wyświetlający pojedynczą fiszkę i jej przyciski akcji.
- Główne elementy: Karta z treścią (przód/tył), przyciski edycji i usunięcia.
- Obsługiwane interakcje: Kliknięcie przycisku edycji, kliknięcie przycisku usunięcia.
- Obsługiwana walidacja: Brak specyficznej.
- Typy: `FlashcardDTO`.
- Propsy: `flashcard`, `onEdit`, `onDelete`.

### EditFlashcardDialog.tsx
- Opis komponentu: Dialog do edycji treści fiszki.
- Główne elementy: Formularze dla przodu i tyłu fiszki, przyciski anulowania i zapisania.
- Obsługiwane interakcje: Edycja pól, zatwierdzenie zmian, anulowanie.
- Obsługiwana walidacja: 
  - Walidacja długości (przód max 200 znaków, tył max 500 znaków)
  - Sprawdzenie, czy pola nie są puste
- Typy: `FlashcardDTO`, `UpdateFlashcardCommand`.
- Propsy: `isOpen`, `onClose`, `onSave`, `flashcard`.

### DeleteFlashcardDialog.tsx
- Opis komponentu: Dialog potwierdzenia usunięcia fiszki.
- Główne elementy: Komunikat potwierdzenia, przyciski anulowania i usunięcia.
- Obsługiwane interakcje: Potwierdzenie lub anulowanie usunięcia.
- Obsługiwana walidacja: Brak specyficznej.
- Typy: `FlashcardDTO`.
- Propsy: `isOpen`, `onClose`, `onConfirm`, `flashcard`.

### Pagination.tsx
- Opis komponentu: Komponent paginacji listy fiszek.
- Główne elementy: Przyciski zmiany strony, licznik stron, selektor liczby elementów na stronę.
- Obsługiwane interakcje: Zmiana strony, zmiana liczby elementów na stronę.
- Obsługiwana walidacja: Sprawdzenie, czy numer strony jest w dopuszczalnym zakresie.
- Typy: `PaginationProps`.
- Propsy: `currentPage`, `totalPages`, `pageSize`, `onPageChange`, `onPageSizeChange`.

### EmptyState.tsx
- Opis komponentu: Komponent wyświetlany, gdy użytkownik nie ma żadnych fiszek.
- Główne elementy: Komunikat, opcjonalnie przycisk przekierowujący do generowania fiszek.
- Obsługiwane interakcje: Kliknięcie przycisku przekierowania.
- Obsługiwana walidacja: Brak specyficznej.
- Typy: Brak specyficznych.
- Propsy: Brak specyficznych.

## 5. Typy
```typescript
// ViewModel dla listy fiszek (agreguje dane potrzebne do wyświetlenia widoku)
interface FlashcardsListViewModel {
  flashcards: FlashcardDTO[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}

// Parametry zapytania do API
interface FlashcardsQueryParams {
  page: number;
  pageSize: number;
}

// Props dla komponentu paginacji
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}
```

## 6. Zarządzanie stanem
Do zarządzania stanem widoku listy fiszek potrzebny będzie customowy hook `useFlashcards`:

```typescript
function useFlashcards(initialPage = 1, initialPageSize = 10) {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/flashcards/getFlashcards?page=${currentPage}&pageSize=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Wystąpił problem podczas pobierania fiszek');
      }
      
      const data = await response.json();
      setFlashcards(data);
      // Pobranie całkowitej liczby elementów z nagłówka (zakładając, że API zwraca taką informację)
      const totalCount = response.headers.get('X-Total-Count');
      setTotalItems(totalCount ? parseInt(totalCount, 10) : 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      setFlashcards([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  // Efekt pobierający dane przy zmianie strony lub liczby elementów
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Funkcje do zarządzania paginacją
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Funkcja do usuwania fiszki
  const deleteFlashcard = async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/deleteFlashcard?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się usunąć fiszki');
      }
      
      // Odświeżenie listy po usunięciu
      fetchFlashcards();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania');
      return false;
    }
  };

  // Wyliczenie całkowitej liczby stron
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return {
    flashcards,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    isLoading,
    error,
    handlePageChange,
    handlePageSizeChange,
    deleteFlashcard,
    refreshFlashcards: fetchFlashcards
  };
}
```

## 7. Integracja API
Widok będzie korzystał z dwóch endpointów API:

1. **GET /api/flashcards/getFlashcards**
   - Parametry zapytania: `page`, `pageSize`
   - Odpowiedź: Tablica `FlashcardDTO[]`
   - Obsługa błędów: 400 (nieprawidłowe parametry), 401 (brak autoryzacji)

2. **DELETE /api/flashcards/deleteFlashcard**
   - Parametry zapytania: `id` (identyfikator fiszki)
   - Odpowiedź: 204 (No Content) w przypadku powodzenia
   - Obsługa błędów: 400 (nieprawidłowy identyfikator), 401 (brak autoryzacji), 404 (fiszka nie znaleziona)

Obie integracje są obsługiwane przez hook `useFlashcards`, który zarządza stanem, pobiera dane i obsługuje operacje usuwania.

## 8. Interakcje użytkownika
1. **Paginacja:**
   - Kliknięcie przycisku następnej/poprzedniej strony → zmiana `currentPage`, ponowne pobranie danych
   - Zmiana liczby elementów na stronę → zmiana `pageSize`, reset do pierwszej strony, ponowne pobranie danych

2. **Edycja fiszki:**
   - Kliknięcie przycisku edycji → otwarcie `EditFlashcardDialog` z danymi fiszki
   - Wprowadzenie zmian → walidacja pól
   - Kliknięcie "Zapisz" → wywołanie API do aktualizacji fiszki, zamknięcie dialogu, odświeżenie listy
   - Kliknięcie "Anuluj" → zamknięcie dialogu bez zmian

3. **Usuwanie fiszki:**
   - Kliknięcie przycisku usunięcia → otwarcie `DeleteFlashcardDialog` z potwierdzeniem
   - Kliknięcie "Potwierdź" → wywołanie API do usunięcia fiszki, zamknięcie dialogu, odświeżenie listy
   - Kliknięcie "Anuluj" → zamknięcie dialogu bez zmian

## 9. Warunki i walidacja
1. **Walidacja w formularzu edycji:**
   - Przód fiszki: niepusty, maksymalnie 200 znaków
   - Tył fiszki: niepusty, maksymalnie 500 znaków
   - Walidacja wykonywana przy próbie zapisu i na bieżąco przy wpisywaniu tekstu

2. **Walidacja parametrów paginacji:**
   - Numer strony: liczba całkowita, większa od 0
   - Liczba elementów na stronę: liczba całkowita, większa od 0, maksymalnie 100

3. **Walidacja stanu aplikacji:**
   - Sprawdzenie, czy użytkownik jest zalogowany przed renderowaniem widoku
   - Sprawdzenie, czy operacje są wykonywane na fiszkach należących do zalogowanego użytkownika

## 10. Obsługa błędów
1. **Pobieranie danych:**
   - Wyświetlenie komunikatu błędu w przypadku niepowodzenia pobrania danych
   - Pokazanie przycisku ponownej próby
   - Obsługa braku internetu lub problemów z serwerem

2. **Edycja fiszki:**
   - Wyświetlenie komunikatu błędu w przypadku niepowodzenia edycji
   - Zachowanie wprowadzonych danych w formularzu
   - Możliwość ponowienia próby

3. **Usuwanie fiszki:**
   - Wyświetlenie komunikatu błędu w przypadku niepowodzenia usunięcia
   - Możliwość ponowienia próby
   - Zachowanie dialogu otwartego w przypadku błędu

4. **Brak danych:**
   - Wyświetlenie komponentu `EmptyState` gdy użytkownik nie ma żadnych fiszek
   - Propozycja utworzenia nowych fiszek

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury plików:
   - `src/pages/flashcards.astro` - główny widok
   - `src/components/flashcards/FlashcardsList.tsx` - lista fiszek
   - `src/components/flashcards/FlashcardItem.tsx` - pojedyncza fiszka
   - `src/components/flashcards/EditFlashcardDialog.tsx` - dialog edycji
   - `src/components/flashcards/DeleteFlashcardDialog.tsx` - dialog usunięcia
   - `src/components/flashcards/Pagination.tsx` - komponent paginacji
   - `src/components/flashcards/EmptyState.tsx` - stan pustej listy

2. Implementacja customowego hooka `useFlashcards` w `src/components/hooks/useFlashcards.ts`.

3. Utworzenie głównego komponentu Astro (`flashcards.astro`):
   - Implementacja routingu
   - Sprawdzenie zalogowania użytkownika
   - Podłączenie komponentu React listy fiszek

4. Implementacja komponentów React:
   - `FlashcardsList.tsx` z paginacją i stanem ładowania
   - `FlashcardItem.tsx` z opcjami edycji i usuwania
   - `EditFlashcardDialog.tsx` z formularzem edycji
   - `DeleteFlashcardDialog.tsx` z potwierdzeniem usunięcia
   - `Pagination.tsx` z obsługą zmiany strony

5. Implementacja obsługi błędów i stanów pustych.

6. Implementacja funkcji usuwania i edycji fiszek z integracją z API.

7. Testowanie integracji z API i zachowania interfejsu.

8. Finalizacja stylów i dopracowanie UX zgodnie z wymaganiami. 