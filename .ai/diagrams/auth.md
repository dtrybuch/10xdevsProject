sequenceDiagram
autonumber

    participant Browser
    participant Middleware
    participant API
    participant SupabaseAuth

    %% Login Flow
    Note over Browser,SupabaseAuth: Proces logowania
    Browser->>Middleware: Wejście na chronioną stronę
    activate Middleware
    Middleware->>Middleware: Sprawdzenie sesji
    alt Brak sesji
        Middleware-->>Browser: Przekierowanie na /auth/login
    end
    deactivate Middleware

    Browser->>API: POST /api/auth/login (email, hasło)
    activate API
    API->>API: Walidacja danych wejściowych
    API->>SupabaseAuth: signInWithPassword()

    alt Błędne dane logowania
        SupabaseAuth-->>API: Błąd autentykacji
        API-->>Browser: 400 Bad Request + komunikat błędu
    else Poprawne dane
        SupabaseAuth->>API: Token JWT + dane użytkownika
        API->>API: Utworzenie sesji (cookies)
        API-->>Browser: 200 OK + przekierowanie do /dashboard
    end
    deactivate API

    %% Rejestracja
    Note over Browser,SupabaseAuth: Proces rejestracji
    Browser->>API: POST /api/auth/register (email, hasło)
    activate API
    API->>API: Walidacja danych rejestracyjnych
    API->>SupabaseAuth: signUp()

    alt Błąd rejestracji
        SupabaseAuth-->>API: Błąd (np. email zajęty)
        API-->>Browser: 400 Bad Request + komunikat błędu
    else Sukces
        SupabaseAuth->>API: Potwierdzenie utworzenia konta
        API-->>Browser: 200 OK + przekierowanie do /auth/login
    end
    deactivate API

    %% Odzyskiwanie hasła
    Note over Browser,SupabaseAuth: Proces odzyskiwania hasła
    Browser->>API: POST /api/auth/password-recovery (email)
    activate API
    API->>SupabaseAuth: passwordRecovery()
    SupabaseAuth->>SupabaseAuth: Generowanie tokenu resetującego
    SupabaseAuth-->>Browser: Email z linkiem resetującym
    deactivate API

    Browser->>API: POST /api/auth/password-reset (token, nowe hasło)
    activate API
    API->>SupabaseAuth: passwordReset()
    alt Token nieważny
        SupabaseAuth-->>API: Błąd walidacji tokenu
        API-->>Browser: 400 Bad Request
    else Token ważny
        SupabaseAuth->>API: Potwierdzenie zmiany hasła
        API-->>Browser: 200 OK + przekierowanie do /auth/login
    end
    deactivate API

    %% Weryfikacja sesji
    Note over Browser,SupabaseAuth: Weryfikacja sesji
    Browser->>Middleware: Żądanie chronionego zasobu
    activate Middleware
    Middleware->>SupabaseAuth: Weryfikacja JWT

    alt Token wygasł
        SupabaseAuth-->>Middleware: Token wygasł
        Middleware->>SupabaseAuth: Próba odświeżenia tokenu
        alt Odświeżenie udane
            SupabaseAuth->>Middleware: Nowy token JWT
            Middleware->>API: Kontynuacja żądania
            API-->>Browser: Odpowiedź z danymi
        else Odświeżenie nieudane
            Middleware-->>Browser: Przekierowanie na /auth/login
        end
    else Token ważny
        SupabaseAuth->>Middleware: Token zweryfikowany
        Middleware->>API: Kontynuacja żądania
        API-->>Browser: Odpowiedź z danymi
    end
    deactivate Middleware

    %% Wylogowanie
    Note over Browser,SupabaseAuth: Proces wylogowania
    Browser->>API: POST /api/auth/logout
    activate API
    API->>SupabaseAuth: signOut()
    SupabaseAuth->>API: Potwierdzenie wylogowania
    API->>API: Usunięcie sesji (cookies)
    API-->>Browser: Przekierowanie na /auth/login
    deactivate API
