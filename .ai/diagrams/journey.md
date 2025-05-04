stateDiagram-v2
[*] --> StronaGlowna

    state "Strona Główna" as StronaGlowna {
        [*] --> SprawdzanieAutoryzacji
        state if_auth <<choice>>
        SprawdzanieAutoryzacji --> if_auth
        if_auth --> ZalogowanyUzytkownik: Sesja aktywna
        if_auth --> NiezalogowanyUzytkownik: Brak sesji
    }

    state "Proces Logowania" as Logowanie {
        [*] --> FormularzLogowania
        FormularzLogowania --> WalidacjaDanych
        state if_dane <<choice>>
        WalidacjaDanych --> if_dane
        if_dane --> BledneLogowanie: Niepoprawne dane
        if_dane --> UtworzenieSesji: Poprawne dane
        BledneLogowanie --> FormularzLogowania: Ponów próbę
        UtworzenieSesji --> [*]
    }

    state "Proces Rejestracji" as Rejestracja {
        [*] --> FormularzRejestracji
        FormularzRejestracji --> WalidacjaRejestracji
        state if_rejestracja <<choice>>
        WalidacjaRejestracji --> if_rejestracja
        if_rejestracja --> BlednaRejestracja: Błąd walidacji
        if_rejestracja --> UtworzenieKonta: Dane poprawne
        BlednaRejestracja --> FormularzRejestracji: Popraw dane
        UtworzenieKonta --> [*]
    }

    state "Odzyskiwanie Hasła" as OdzyskiwanieHasla {
        [*] --> FormularzOdzyskiwania
        FormularzOdzyskiwania --> WeryfikacjaEmail
        state if_email <<choice>>
        WeryfikacjaEmail --> if_email
        if_email --> BladWeryfikacji: Email nie istnieje
        if_email --> WyslanieMaila: Email znaleziony
        BladWeryfikacji --> FormularzOdzyskiwania: Spróbuj ponownie
        WyslanieMaila --> OczekiwanieNaReset
        OczekiwanieNaReset --> FormularzResetu: Link z maila
        FormularzResetu --> WeryfikacjaTokenu
        state if_token <<choice>>
        WeryfikacjaTokenu --> if_token
        if_token --> BladTokenu: Token nieważny
        if_token --> ZmianaHasla: Token poprawny
        BladTokenu --> [*]: Wróć do odzyskiwania
        ZmianaHasla --> [*]
    }

    state "Panel Użytkownika" as PanelUzytkownika {
        [*] --> WeryfikacjaSesji
        state if_sesja <<choice>>
        WeryfikacjaSesji --> if_sesja
        if_sesja --> OdswiezenieSesji: Sesja wygasła
        if_sesja --> DostepDoFunkcji: Sesja aktywna
        state if_odswiezenie <<choice>>
        OdswiezenieSesji --> if_odswiezenie
        if_odswiezenie --> DostepDoFunkcji: Sukces
        if_odswiezenie --> WymaganeLogowanie: Błąd
    }

    NiezalogowanyUzytkownik --> Logowanie: Przycisk Zaloguj
    NiezalogowanyUzytkownik --> Rejestracja: Przycisk Rejestracja
    NiezalogowanyUzytkownik --> OdzyskiwanieHasla: Zapomniałem hasła

    Logowanie --> PanelUzytkownika: Sukces logowania
    Rejestracja --> Logowanie: Sukces rejestracji
    OdzyskiwanieHasla --> Logowanie: Hasło zresetowane

    ZalogowanyUzytkownik --> PanelUzytkownika: Dostęp do funkcji
    WymaganeLogowanie --> Logowanie: Przekierowanie

    PanelUzytkownika --> [*]: Wylogowanie
