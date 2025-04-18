# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter integruje się z interfejsem API OpenRouter w celu uzupełnienia czatów opartych na LLM. Umożliwia przetwarzanie komunikatów systemowych i użytkownika, formatuje odpowiedzi według precyzyjnie zdefiniowanego schematu JSON oraz zarządza parametrami modelu podczas komunikacji z API.

## 2. Opis konstruktora
Konstruktor usługi inicjalizuje konfigurację parametrów modelu, kluczy API i ustawień sieciowych oraz kluczowe moduły: moduł klienta API, preprocesor wiadomości oraz moduł obsługi błędów.

### 2.1. Kluczowe komponenty usługi OpenRouter
1. Komponent przetwarzania komunikatów systemowych
   - Funkcjonalność: Normalizacja i przygotowanie wiadomości systemowych (np. inicjalizacja komunikacji).
   - Wyzwania:
     1) Utrzymanie spójności formatu komunikatów.
     2) Obsługa różnorodności treści systemowych.
   - Rozwiązania:
     1) Wprowadzenie standardowego szablonu komunikatów.
     2) Walidacja i sanitizacja danych wejściowych.
2. Komponent przetwarzania komunikatów użytkownika
   - Funkcjonalność: Odbiór i wstępna obróbka wiadomości użytkownika.
   - Wyzwania:
     1) Walidacja i sanitizacja danych wejściowych.
     2) Zapewnienie bezpieczeństwa przed atakami injection.
   - Rozwiązania:
     1) Implementacja mechanizmów walidacji oraz sanitizacji danych.
     2) Użycie zabezpieczeń na poziomie aplikacji.
3. Moduł obsługi formatu odpowiedzi (`response_format` handler)
   - Funkcjonalność: Weryfikacja poprawności struktury odpowiedzi zgodnie z predefiniowanym schematem JSON.
   - Wyzwania:
     1) Niespójność struktury danych zwracanych przez API.
   - Rozwiązania:
     1) Zastosowanie walidatora schematu JSON (np. przy użyciu biblioteki do walidacji schematów).
4. Komponent zarządzania parametrami modelu i komunikacją z API
   - Funkcjonalność: Ustawienie nazwy modelu oraz parametrów (np. temperatura, max_tokens) oraz realizacja komunikacji z API.
   - Wyzwania:
     1) Synchronizacja dynamicznych parametrów z wymaganiami API.
     2) Radzenie sobie z timeoutami i błędami połączenia.
   - Rozwiązania:
     1) Dynamiczna konfiguracja parametrów z mechanizmami fallback.
     2) Implementacja retry z exponential backoff.
5. Komponent zarządzania błędami i logowaniem
   - Funkcjonalność: Monitorowanie, rejestrowanie błędów oraz eskalacja problemów.
   - Wyzwania:
     1) Efektywna diagnoza problemów bez ujawniania danych wrażliwych.
   - Rozwiązania:
     1) Centralizacja logów oraz ograniczenie logowania danych wrażliwych.

## 3. Publiczne metody i pola
1. `sendChatMessage(systemMessage: string, userMessage: string): Promise<Response>`
   - Wysyła zapytanie do OpenRouter API, przekazując komunikaty systemowe i użytkownika oraz zwraca ustrukturyzowaną odpowiedź.
2. `setModelParameters(params: ModelParams): void`
   - Umożliwia ustawienie parametrów modelu, takich jak temperatura, maksymalna liczba tokenów, top_p itp.
3. `getResponseFormat(): object`
   - Zwraca zdefiniowany schemat formatu odpowiedzi, np.:
     `{ type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { answer: 'string', confidence: 'number' } } }`
4. Pola konfiguracji, takie jak:
   - `apiKey`: Klucz API dla OpenRouter.
   - `modelName`: Nazwa modelu (np. "gpt-4").
   - `modelParameters`: Parametry modelu.

## 4. Prywatne metody i pola
1. `#preparePayload(systemMessage: string, userMessage: string): object`
   - Prywatna metoda przygotowująca ładunek żądania, integrująca i formatująca komunikaty systemowe i użytkownika.
   **Przykłady:**
   a. Komunikat systemowy: "SYSTEM: Inicjalizacja komunikacji."
   b. Komunikat użytkownika: "USER: Proszę o wyjaśnienie funkcji usługi."
2. `#handleApiResponse(response: any): Response`
   - Prywatna metoda przetwarzająca odpowiedź z API, walidująca ją względem `response_format`.
3. `#logError(error: any): void`
   - Prywatna metoda do rejestrowania błędów.
4. Pola prywatne:
   - `#httpClient`: Klient HTTP do komunikacji z API.
   - `#config`: Konfiguracja usługi.

## 5. Obsługa błędów
1. Błąd sieciowy (np. brak połączenia, timeout).
   - Rozwiązanie: Automatyczny retry z mechanizmem exponential backoff.
2. Błąd uwierzytelnienia (np. nieprawidłowy klucz API).
   - Rozwiązanie: Weryfikacja konfiguracji przy starcie usługi oraz walidacja klucza API przed wysłaniem żądania.
3. Błąd niezgodności formatu odpowiedzi.
   - Rozwiązanie: Walidacja odpowiedzi względem zdefiniowanego schematu `response_format` za pomocą walidatora.
4. Błąd nieprawidłowych parametrów żądania.
   - Rozwiązanie: Wstępna walidacja danych wejściowych.
5. Błąd serwera API.
   - Rozwiązanie: Mechanizmy retry lub fallback oraz przekazywanie informacji o błędzie do użytkownika.

## 6. Kwestie bezpieczeństwa
1. Przechowywanie kluczy API wyłącznie w zmiennych środowiskowych z ograniczonym dostępem.
2. Ograniczenie logowania danych wrażliwych.

## 7. Plan wdrożenia krok po kroku
1. **Inicjalizacja projektu i konfiguracja środowiska:**
   - Ustawienie zmiennych środowiskowych (np. `OPENROUTER_API_KEY`, `MODEL_NAME`).
   - Wdrożenie menedżera konfiguracji.
2. **Implementacja kluczowych komponentów:**
   - Utworzenie modułu klienta API do komunikacji z OpenRouter.
   - Implementacja preprocesora wiadomości do formatowania komunikatów systemowych i użytkownika.
   - Utworzenie modułu formatującego odpowiedzi według schematu:
     `{ type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { answer: 'string', confidence: 'number' } } }`
   - Implementacja modułu obsługi błędów i logowania.
3. **Implementacja publicznych metod:**
   - Opracowanie metody `sendChatMessage` do wysyłania komunikatów i odbierania ustrukturyzowanych odpowiedzi.
   - Opracowanie metod `setModelParameters` i `getResponseFormat` do zarządzania konfiguracją modelu.
4. **Walidacja błędów:**
   - Symulacja scenariuszy błędów (sieciowych, uwierzytelnienia, formatu odpowiedzi) w celu weryfikacji mechanizmów obsługi błędów.
5. **Wdrożenie zabezpieczeń:**
   - Weryfikacja przechowywania kluczy API, walidacja danych wejściowych oraz konfiguracja bezpiecznych połączeń.
6. **Monitorowanie i logowanie:**
   - Wdrożenie systemu monitoringu oraz centralizacja logów.
   - Regularny przegląd logów i alertowanie o wykrytych problemach.
7. **Konfiguracja elementów OpenRouter API:**
   - Systemowy komunikat: Ustawienie szablonu, np.: "SYSTEM: Inicjalizacja komunikacji."
   - Komunikat użytkownika: Ustawienie szablonu, np.: "USER: Wprowadź swoje zapytanie."
   - `response_format`: Definicja schematu odpowiedzi, np.:
     `{ type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { answer: 'string', confidence: 'number' } } }`
   - Nazwa modelu: Przykładowa wartość, np. "gpt-4".
   - Parametry modelu: Przykładowo `{ temperature: 0.7, max_tokens: 512, top_p: 0.9 }`. 