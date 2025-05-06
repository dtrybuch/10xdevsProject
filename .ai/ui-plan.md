# Architektura UI dla Fiszki AI

## 1. Przegląd struktury UI

Interfejs użytkownika składa się z kilku głównych widoków, które odpowiadają kluczowym funkcjonalnościom opisanym w PRD i planie API. Aplikacja umożliwia użytkownikom rejestrację/logowanie, generowanie AI fiszek, zarządzanie fiszkami, przeglądanie statystyk na dashboardzie, zarządzanie kontem oraz przeprowadzanie sesji nauki. Całość komponowana jest przy użyciu React, a walidacja formularzy oparta jest na schematach zgodnych z backendem (np. Zod). Responsywność i dostępność podstawowa zapewnia intuicyjne poruszanie się po aplikacji.

## 2. Lista widoków

1. **Widok rejestracji/logowania**

   - Ścieżka widoku: `/login` lub `/auth`
   - Główny cel: Umożliwienie użytkownikowi utworzenia konta oraz logowania.
   - Kluczowe informacje: Formularze zbierające adres e-mail i hasło, komunikaty o błędach, wskaźniki walidacji.
   - Kluczowe komponenty widoku: Formularz logowania, przycisk przesyłania, komunikaty walidacyjne.
   - UX, dostępność i względy bezpieczeństwa: Prosty i czytelny formularz, obsługa keyboard focus, natychmiastowa walidacja oraz bezpieczne przesyłanie danych.

2. **Ekran generacji fiszek**

   - Ścieżka widoku: `/generate`
   - Główny cel: Umożliwienie użytkownikowi wklejenia tekstu (od 1000 do 10 000 znaków) i wygenerowania kandydatów na fiszki przez AI zmozliwościa ich zaakceptowania, edycji i usunięcia.
   - Kluczowe informacje: Pole tekstowe z informacją o limicie znaków, przycisk inicjujący proces generowania, wizualizacja stanu przetwarzania (np. spinner lub skeletony) oraz komunikaty błędów.
   - Kluczowe komponenty widoku: Textarea, przycisk "Generuj", wskaźnik ładowania, alerty błędów.
   - UX, dostępność i względy bezpieczeństwa: Wyraźne komunikaty o ograniczeniach, responsywny interfejs, natychmiastowa informacja zwrotna o postępie, walidacja limitu znaków.

3. **Widok listy fiszek ("Moje fiszki")**

   - Ścieżka widoku: `/flashcards`
   - Główny cel: Prezentacja wszystkich fiszek użytkownika wraz z możliwością edycji, usuwania i zatwierdzania fiszek.
   - Kluczowe informacje: Lista fiszek z danymi (przód, tył, status), przyciski edycji i usuwania.
   - Kluczowe komponenty widoku: Tabela lub siatka z fiszkami, modal dialog do edycji/usuwania.
   - UX, dostępność i względy bezpieczeństwa: Intuicyjna nawigacja w liście, potwierdzenia przed usunięciem, czytelny układ i responsywność, mechanizmy zabezpieczające przed przypadkową akcją.

4. **Dashboard**

   - Ścieżka widoku: `/dashboard`
   - Główny cel: Prezentacja statystyk użytkownika, podsumowań sesji oraz stanu fiszek.
   - Kluczowe informacje: Liczba fiszek, statystyki sesji, najnowsze aktywności, wykresy i karty informacyjne.
   - Kluczowe komponenty widoku: Karty (cards) z danymi, wykresy, wskaźniki KPI.
   - UX, dostępność i względy bezpieczeństwa: Przejrzysty układ zapewniający szybki dostęp do najważniejszych danych, czytelne wizualizacje, responsywność oraz ochrona danych wizualnych.

5. **Panel użytkownika (Profil/ustawienia)**

   - Ścieżka widoku: `/profil` lub `/settings`
   - Główny cel: Zarządzanie danymi użytkownika, w tym edycja profilu, zmiana hasła oraz konfiguracja ustawień konta.
   - Kluczowe informacje: Dane osobowe, opcje zmiany hasła, ustawienia prywatności.
   - Kluczowe komponenty widoku: Formularze edycji danych, pola tekstowe, przyciski zapisu zmian.
   - UX, dostępność i względy bezpieczeństwa: Jasne i intuicyjne formularze, podstawowa walidacja w locie, ochrona danych użytkownika oraz komunikaty potwierdzające zapis zmian.

6. **Ekran sesji powtórkowych**
   - Ścieżka widoku: `/learning`
   - Główny cel: Przeprowadzenie sesji nauki, w której użytkownik przegląda fiszki, ocenia je i monitoruje postępy nauki.
   - Kluczowe informacje: Aktualnie wyświetlana fiszka, przyciski oceny (np. "Zapamiętana", "Nie zapamiętana"), licznik postępu sesji.
   - Kluczowe komponenty widoku: Karta fiszki, przyciski oceny, licznik, ewentualne animacje zmiany fiszek.
   - UX, dostępność i względy bezpieczeństwa: Prosty i przejrzysty interfejs, natychmiastowa informacja zwrotna, dostosowanie dla użytkowników z ograniczeniami wzrokowymi oraz intuicyjne sterowanie sesją.

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na stronę i zostaje przekierowany do widoku rejestracji/logowania.
2. Po poprawnym zalogowaniu użytkownik trafia do głównego widoku, którym może być ekran generacji fiszek.
3. W ekranie generacji fiszek użytkownik wkleja tekst, inicjuje generowanie fiszek przez AI i oczekuje na wyniki.
4. Po otrzymaniu wyników użytkownik może przeglądać kandydatów, a następnie zatwierdzać fiszki pojedynczo lub zaznaczać je do zbiorczego zatwierdzenia. może je też edytować i usuwać.
5. Użytkownik przechodzi do widoku "Moje fiszki", gdzie może zarządzać fiszkami – edytować, usuwać lub ponownie zatwierdzić.
6. Użytkownik ma możliwość przejścia do sesji powtórkowych, gdzie aktywnie powtarza fiszki i monitoruje postępy sesji.
7. W dowolnym momencie użytkownik korzysta z panelu nawigacyjnego w celu przejścia do dashboardu lub zarządzania kontem w panelu użytkownika.

## 4. Układ i struktura nawigacji

- Główny pasek nawigacyjny umieszczony w nagłówku zawiera odnośniki do: Dashboard, Generacja fiszek, Moje fiszki, Sesja nauki oraz Profil i przycisk do wylogowania.
- Na większych ekranach, opcjonalnie, dostępne jest menu boczne z rozszerzonymi opcjami.
- Na urządzeniach mobilnych używane jest menu hamburgerowe, które pozwala na wygodne przeglądanie opcji.
- Breadcrumbs mogą być dodane w widokach głębiej zagnieżdżonych, np. w modalach edycji.

## 5. Kluczowe komponenty

- Formularz rejestracji/logowania: Zapewnia walidację danych i bezpieczne przesyłanie informacji.
- Textarea do wklejania tekstu: Z wskaźnikiem limitu znaków oraz natychmiastową walidacją.
- Modal dialog: Służy do edycji i potwierdzania usunięcia fiszek, zapewnia bezpieczeństwo operacji.
- Lista/tabela wyświetlająca fiszki: Z opcją zaznaczania do zbiorczego zatwierdzania oraz łatwej nawigacji między fiszkami.
- Karty (cards): Do prezentacji statystyk i ważnych informacji na dashboardzie.
- Komponent sesji powtórkowej: Umożliwia interaktywną naukę z natychmiastową informacją zwrotną.
- Globalny kontekst aplikacji (React Context): Zarządza stanem logowania, danymi użytkownika i danymi pobieranymi z API, umożliwiając spójność danych w aplikacji.
- Komponenty powiadomień i alertów: Informują użytkownika o sukcesie operacji, błędach lub wymaganych działaniach potwierdzających, dbając o UX i bezpieczeństwo.
