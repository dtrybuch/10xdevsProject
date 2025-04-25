# Plan testów dla Fiszki AI

## 1. Wprowadzenie i cele testowania

Fiszki AI to aplikacja webowa zaprojektowana do tworzenia wysokiej jakości fiszkek edukacyjnych przy wykorzystaniu sztucznej inteligencji. Aplikacja umożliwia generowanie, zarządzanie i naukę z fiszkek, integrując się z algorytmami powtórek spaced repetition.

Główne cele testowania:
- Weryfikacja poprawności funkcjonowania generacji fiszkek AI
- Zapewnienie niezawodności procesów zapisywania i zarządzania fiszkami
- Sprawdzenie wydajności aplikacji przy różnych obciążeniach
- Weryfikacja bezpieczeństwa danych użytkowników
- Ocena dostępności i użyteczności interfejsu użytkownika

## 2. Zakres testów

### 2.1 Komponenty w zakresie testów
- Frontend: komponenty React, widoki Astro
- Backend: API endpoints, serwisy generacji AI
- Integracja z Supabase (autentykacja, baza danych)
- Integracja z OpenRouter.ai (generacja AI)

### 2.2 Funkcjonalności w zakresie testów
- Rejestracja i logowanie użytkowników
- Generowanie fiszkek przez AI
- Ręczne tworzenie fiszkek
- Edycja, usuwanie i zarządzanie fiszkami
- System powtórek
- Dashboard statystyk

## 3. Typy testów do przeprowadzenia

### 3.1 Testy jednostkowe
- **Komponenty React**
  - Testowanie renderowania i stanu komponentów
  - Weryfikacja prawidłowego działania hooków
  - Sprawdzenie obsługi zdarzeń użytkownika

- **Serwisy i utilities**
  - Weryfikacja metod w serwisach (generacja.service.ts, openrouter.service.ts)
  - Sprawdzenie walidacji danych

### 3.2 Testy integracyjne
- **Integracja frontend-backend**
  - Weryfikacja poprawności komunikacji między komponentami React a API
  - Testowanie przepływu danych przez całą aplikację

- **Integracja z OpenRouter.ai**
  - Sprawdzenie poprawności komunikacji z API OpenRouter
  - Weryfikacja przetwarzania odpowiedzi z serwisu AI

- **Integracja z Supabase**
  - Testowanie operacji CRUD na bazie danych
  - Weryfikacja autentykacji i autoryzacji

### 3.3 Testy end-to-end (E2E)
- Symulacja pełnych scenariuszy użytkownika
- Testowanie przepływu od rejestracji do generacji i nauki z fiszkek

### 3.4 Testy wydajnościowe
- Testowanie czasu odpowiedzi aplikacji przy różnej liczbie fiszkek
- Pomiar wydajności generacji AI dla tekstów o różnej długości

### 3.5 Testy bezpieczeństwa
- Testowanie zabezpieczeń autentykacji
- Weryfikacja ochrony danych użytkownika
- Sprawdzenie poprawności walidacji danych wejściowych

### 3.6 Testy dostępności
- Weryfikacja zgodności z WCAG 2.1
- Testowanie z czytnikami ekranu
- Sprawdzenie obsługi z poziomu klawiatury

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Rejestracja i logowanie
1. **Rejestracja nowego użytkownika**
   - Oczekiwany rezultat: Użytkownik zostaje zarejestrowany i przekierowany do dashboardu
   
2. **Logowanie istniejącego użytkownika**
   - Oczekiwany rezultat: Użytkownik zostaje zalogowany i przekierowany do dashboardu

3. **Próba rejestracji z istniejącym emailem**
   - Oczekiwany rezultat: Wyświetlenie odpowiedniego komunikatu błędu

4. **Logowanie z niepoprawnymi danymi**
   - Oczekiwany rezultat: Wyświetlenie komunikatu o błędnych danych logowania

### 4.2 Generowanie fiszkek przez AI
1. **Generacja fiszkek z prawidłowym tekstem (1000-10000 znaków)**
   - Oczekiwany rezultat: Wyświetlenie propozycji fiszkek wygenerowanych przez AI

2. **Generacja z tekstem krótszym niż 1000 znaków**
   - Oczekiwany rezultat: Komunikat o zbyt krótkim tekście

3. **Generacja z tekstem dłuższym niż 10000 znaków**
   - Oczekiwany rezultat: Komunikat o zbyt długim tekście

4. **Obsługa błędów API OpenRouter**
   - Oczekiwany rezultat: Komunikat o błędzie generacji

5. **Obciążeniowe testy generacji**
   - Oczekiwany rezultat: Aplikacja działa stabilnie przy wielokrotnych wywołaniach

### 4.3 Zarządzanie fiszkami
1. **Zapisywanie pojedynczej fiszki**
   - Oczekiwany rezultat: Fiszka zapisana w bazie danych

2. **Zapisywanie wielu fiszkek jednocześnie**
   - Oczekiwany rezultat: Wszystkie wybrane fiszki zapisane w bazie danych

3. **Edycja istniejącej fiszki**
   - Oczekiwany rezultat: Zaktualizowane dane fiszki w bazie

4. **Usuwanie fiszki**
   - Oczekiwany rezultat: Fiszka usunięta z bazy danych

5. **Filtrowanie i sortowanie fiszkek**
   - Oczekiwany rezultat: Wyświetlenie fiszkek zgodnie z kryteriami

### 4.4 System powtórek
1. **Inicjalizacja sesji powtórek**
   - Oczekiwany rezultat: Załadowanie fiszkek do sesji powtórek

2. **Oznaczanie fiszkek jako zapamiętane/niezapamiętane**
   - Oczekiwany rezultat: Aktualizacja statusu fiszki w bazie

3. **Integracja z algorytmem spaced repetition**
   - Oczekiwany rezultat: Prawidłowe planowanie kolejności powtórek

### 4.5 Dashboard statystyk
1. **Wyświetlanie statystyk użytkownika**
   - Oczekiwany rezultat: Poprawne dane statystyczne na dashboardzie

2. **Aktualizacja statystyk po sesji nauki**
   - Oczekiwany rezultat: Odświeżone statystyki po zakończonej sesji

## 5. Środowisko testowe

### 5.1 Środowiska
- Środowisko deweloperskie (lokalny serwer deweloperski)
- Środowisko testowe (staging)
- Środowisko produkcyjne (z ograniczonym zakresem testów)

### 5.2 Konfiguracja środowiska
- Node.js w wersji 22.14.0
- Przeglądarki: Chrome, Firefox, Safari, Edge (najnowsze wersje)
- Urządzenia: Desktop, tablet, mobile

### 5.3 Dane testowe
- Przygotowane zestawy tekstów do generacji fiszkek
- Przygotowane konta testowe z różnymi poziomami uprawnień
- Przykładowe zestawy fiszkek dla testów zarządzania i nauki

## 6. Narzędzia do testowania

### 6.1 Narzędzia do testów jednostkowych i integracyjnych
- Vitest dla testów jednostkowych
- Testing Library dla testów komponentów React
- Mock Service Worker (MSW) dla mockowania API

### 6.2 Narzędzia do testów E2E
- Preferowany: Playwright (wsparcie dla wielu przeglądarek i elastyczność)
- Alternatywnie: Cypress (opcjonalnie, jeśli zespół woli tę opcję)

### 6.3 Narzędzia do testów wydajnościowych
- Lighthouse
- WebPageTest

### 6.4 Narzędzia do testów bezpieczeństwa
- OWASP ZAP
- Snyk dla skanowania zależności
- Opcjonalnie: Burp Suite do zaawansowanych audytów bezpieczeństwa

### 6.5 Narzędzia do testów dostępności
- axe-core
- WAVE Evaluation Tool
- Opcjonalnie: Pa11y dla dodatkowych raportów dostępności

## 7. Harmonogram testów

### 7.1 Testy jednostkowe i integracyjne
- Wykonywane przez deweloperów przy każdej zmianie kodu
- Automatycznie uruchamiane przy push do repozytorium

### 7.2 Testy E2E
- Wykonywane przed każdym większym wydaniem
- Codzienne automatyczne testy na środowisku testowym

### 7.3 Testy wydajnościowe i bezpieczeństwa
- Wykonywane raz w tygodniu
- Dodatkowo przed każdym większym wydaniem

### 7.4 Testy dostępności
- Wykonywane przy każdym większym wydaniu UI
- Okresowe audyty dostępności (co 3 miesiące)

## 8. Kryteria akceptacji testów

### 8.1 Testy funkcjonalne
- 100% krytycznych scenariuszy testowych zakończonych sukcesem
- Brak błędów blokujących funkcjonalności

### 8.2 Testy wydajnościowe
- Czas odpowiedzi API < 1s dla 95% requestów
- Czas generacji fiszkek < 5s dla tekstu 10000 znaków
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s

### 8.3 Testy bezpieczeństwa
- Brak krytycznych i wysokich zagrożeń bezpieczeństwa
- Szyfrowanie danych użytkownika
- Prawidłowe zarządzanie sesjami

### 8.4 Testy dostępności
- Zgodność z WCAG 2.1 na poziomie AA
- Brak poważnych problemów z dostępnością

## 9. Role i odpowiedzialności w procesie testowania

### 9.1 Deweloperzy
- Tworzenie i utrzymanie testów jednostkowych
- Wykonywanie podstawowych testów integracyjnych
- Naprawa błędów znalezionych podczas testowania

### 9.2 Testerzy
- Projektowanie i wykonywanie testów E2E
- Przeprowadzanie testów manualnych
- Raportowanie znalezionych błędów

### 9.3 DevOps
- Konfiguracja i utrzymanie środowisk testowych
- Konfiguracja CI/CD dla automatycznych testów
- Monitorowanie wydajności aplikacji

### 9.4 Product Owner
- Definiowanie kryteriów akceptacji
- Zatwierdzanie zmian po naprawie błędów
- Priorytetyzacja naprawiania błędów

## 10. Procedury raportowania błędów

### 10.1 Format raportów błędów
- Tytuł: krótki opis problemu
- Środowisko: gdzie wystąpił błąd
- Ścieżka reprodukcji: kroki do odtworzenia błędu
- Oczekiwane zachowanie: jak aplikacja powinna działać
- Rzeczywiste zachowanie: jak aplikacja faktycznie działa
- Priorytet: krytyczny/wysoki/średni/niski
- Załączniki: zrzuty ekranu, logi, nagrania

### 10.2 Proces obsługi błędów
1. Raportowanie błędu w systemie śledzenia błędów
2. Triage i przypisanie priorytetu
3. Przypisanie do odpowiedniego dewelopera
4. Naprawa błędu
5. Weryfikacja naprawy przez testera
6. Zamknięcie zgłoszenia

### 10.3 Metryki raportowania błędów
- Liczba znalezionych błędów według priorytetu
- Średni czas naprawy błędu
- Liczba błędów powracających
- Trend w liczbie zgłaszanych błędów 