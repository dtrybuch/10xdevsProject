# Specyfikacja modułu autentykacji

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

**Opis:**

- Interfejs zostanie podzielony na dwie główne sekcje: strony publiczne (non-auth) oraz strony chronione (auth). Dla każdej z tych sekcji zostaną użyte dedykowane layouty (np. `NonAuthLayout` dla stron bez logowania oraz `AuthLayout` dla stron dostępnych tylko dla zalogowanych użytkowników).
- Strony Astro (umieszczone w `src/pages`) będą pełnić rolę głównych punktów wejścia i zarządzać routingiem oraz ochroną tras za pomocą middleware umieszczonego np. w `src/middleware/index.ts`.
- Kluczowe strony publiczne: strona logowania (`/login`), rejestracji (`/register`), oraz odzyskiwania hasła (`/forgot-password`). Strony te będą implementowane jako strony Astro, które osużą dynamiczne komponenty React do obsługi formularzy.
- Komponenty React (umieszczone w `src/components`) zostaną wykorzystane do budowania interaktywnych formularzy, takich jak `<LoginForm />`, `<RegisterForm />` i `<ForgotPasswordForm />`. Komponenty te będą oparte na bibliotece Shadcn/ui i stylowane za pomocą Tailwind CSS.
- Rozdzielenie odpowiedzialności:
  - Strony Astro: zarządzają renderowaniem, routingiem oraz integracją z backendem autentykacji. Umożliwiają wstrzykiwanie stanu uwierzytelnienia przy renderowaniu po stronie serwera.
  - Komponenty React: obsługują interakcje użytkownika, logikę formularzy, walidację danych wejściowych (np. format email, długość hasła) oraz wyświetlanie komunikatów błędów. Walidacja będzie odbywać się po stronie klienta przy użyciu bibliotek takich jak React Hook Form lub Formik, a także po stronie backendu.
- Przykładowe przypadki walidacji i komunikaty błędów:
  - Nieprawidłowy format adresu email – wyświetlenie komunikatu "Proszę podać poprawny adres e-mail".
  - Hasło zbyt krótkie – komunikat "Hasło musi mieć co najmniej 8 znaków".
  - Błędy wynikające z nieudanej autentykacji – np. "Niepoprawny email lub hasło".
  - Błąd połączenia z API – komunikat o błędzie sieciowym i sugestia ponowienia próby.
  - Dodatkowo, główny layout (np. `src/layouts/MainLayout.astro`) będzie zawierał globalny nagłówek, w którym znajdą się dynamiczne przyciski: "Zaloguj" (dla niezalogowanych użytkowników) oraz "Wyloguj" (dla zalogowanych), umożliwiając szybki dostęp do funkcji autentykacji.

## 2. LOGIKA BACKENDOWA

**Struktura endpointów API:**

- Wszystkie endpointy będą umieszczone w katalogu `src/pages/api/auth/`.
- Proponowany zestaw endpointów:
  - `/api/auth/register` – rejestracja nowego użytkownika. Przyjmuje dane: email, hasło, potwierdzenie hasła.
  - `/api/auth/login` – logowanie użytkownika. Weryfikuje email i hasło, a następnie tworzy sesję użytkownika.
  - `/api/auth/logout` – wylogowywanie użytkownika. Usuwa aktywną sesję.
  - `/api/auth/password-recovery` – inicjacja procesu odzyskiwania hasła. Wysyła e-mail z linkiem resetującym hasło.
  - `/api/auth/password-reset` – endpoint do resetowania hasła po kliknięciu w link wysłany e-mailem.

**Modele danych i walidacja:**

- Dane użytkownika będą przechowywane w bazie, przy czym model zawiera pola takie jak: email, zahashowane hasło, data rejestracji oraz ewentualne tokeny do resetowania hasła.
- Walidacja danych wejściowych zostanie zaimplementowana przy użyciu bibliotek walidacyjnych typu Zod lub Yup zarówno na poziomie endpointów jak i w serwisach wewnętrznych.
- Mechanizm obsługi wyjątków zapewni, że wszelkie błędy (np. błędy walidacji, problemy z bazą danych czy nieprawidłowe żądania) będą wychwytywane i zwracane z odpowiednimi kodami HTTP oraz czytelnymi komunikatami, a także logowane dla celów diagnostycznych.

**Renderowanie stron server-side:**

- Strony wymagające danych uwierzytelnionych (np. dashboard) będą renderowane po stronie serwera przy wykorzystaniu Astro. Middleware dokona weryfikacji sesji użytkownika, korzystając z tokenów lub ciasteczek, aby zapewnić odpowiedni dostęp.
- W razie braku autentykacji nastąpi przekierowanie do strony logowania.
- Dodatkowo, funkcjonalności takie jak generowanie fiszek na bazie wklejonego tekstu (US-003) będą dostępne tylko dla zalogowanych użytkowników, co zapewni, że nikt nieautoryzowany nie może korzystać z aplikacji.

## 3. SYSTEM AUTENTYKACJI

**Integracja z Supabase Auth:**

- Do obsługi autentykacji wykorzystamy Supabase Auth, korzystając z oficjalnego SDK (JavaScript/TypeScript), co pozwoli na zarządzanie rejestracją, logowaniem, wylogowywaniem oraz resetowaniem hasła.
- Nie wykorzystujemy zewnętrznych serwisów logowania (np. Google, GitHub); autentykacja odbywa się wyłącznie przy użyciu poświadczeń email i hasła.
- Na stronach Astro wczytywany będzie klient Supabase, który umożliwi sprawdzenie stanu logowania użytkownika oraz inicjację odpowiednich operacji autentykacyjnych.

**Moduły i serwisy:**

- Utworzymy serwis `authService` (np. w `src/lib/authService.ts`), który będzie abstrakcją nad operacjami Supabase Auth. Metody serwisu obejmą:
  - `register`: przyjmowanie danych rejestracyjnych i tworzenie nowego konta użytkownika w Supabase.
  - `login`: weryfikacja danych logowania i ustanowienie sesji użytkownika.
  - `logout`: zakończenie sesji i wylogowanie użytkownika.
  - `passwordRecovery`: inicjacja procesu odzyskiwania hasła (wysłanie maila z tokenem resetującym).
  - `passwordReset`: resetowanie hasła przy użyciu przesłanego tokena.

**Kontrakty i interfejsy:**

- Definicje typów i interfejsów związanych z użytkownikiem oraz danymi przekazywanymi między frontendem a backendem zostaną umieszczone w `src/types.ts`.
- Kontrakty te zapewnią spójność przesyłania danych w całej aplikacji.

**Bezpieczeństwo i komunikacja:**

- Cała komunikacja odbywać się będzie przez bezpieczny protokół HTTPS.
- Sesje użytkowników mogą być obsługiwane za pomocą bezpiecznych ciasteczek lub tokenów JWT, zapewniając ochronę przed atakami takimi jak CSRF czy XSS.

**Integracja z front-endem:**

- Komponenty React odpowiedzialne za logikę formularzy będą korzystały z `authService` do wywoływania operacji rejestracji, logowania, wylogowania oraz resetowania hasła.
- Po pomyślnym zalogowaniu użytkownik zostanie przekierowany do chronionego obszaru aplikacji, np. dashboardu, a w przypadku błędów odpowiednie komunikaty zostaną wyświetlone.

**Technologie:**

- Astro 5 i React 19: Strony i komponenty interfejsu użytkownika.
- TypeScript 5: Statyczne typowanie dla spójności kodu.
- Tailwind CSS 4: Stylowanie formularzy oraz elementów interfejsu.
- Shadcn/ui: Wykorzystanie gotowych komponentów UI.
- Supabase: Backendowa obsługa autentykacji i zarządzania użytkownikami.

## Podsumowanie

Przedstawiona specyfikacja modułu autentykacji definiuje kompleksowe podejście do implementacji rejestracji, logowania oraz odzyskiwania hasła. Architektura uwzględnia podział na front-end (Astro + React) i backend (API endpointy, walidacja, obsługa wyjątków) oraz ścisłą integrację z Supabase Auth. Rozwiązanie to gwarantuje bezpieczeństwo, intuicyjność oraz spójność działania aplikacji, zgodnie z wymaganiami określonymi w dokumentacji PRD i technologicznym stacku.
