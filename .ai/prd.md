```markdown
# Dokument wymagań produktu (PRD) - Fiszki AI

## 1. Przegląd produktu
Fiszki AI to aplikacja webowa umożliwiająca użytkownikom szybkie tworzenie wysokiej jakości fiszek edukacyjnych, zarówno automatycznie przez AI, jak i manualnie. Aplikacja integruje generowanie fiszek z gotowym algorytmem powtórek, co pozwala na efektywne wykorzystanie metody spaced repetition. Użytkownicy mogą logować się za pomocą podstawowego systemu (e-mail i hasło), a wszystkie fiszki są przechowywane w bazie danych wraz z podstawowymi logami, takimi jak czas wygenerowania, ID użytkownika, status.

## 2. Problem użytkownika
Użytkownicy potrzebują efektywnego sposobu nauki, jednak manualne tworzenie fiszek jest czasochłonne i demotywujące. Brak automatyzacji powoduje, że potencjalnie skuteczna metoda powtórek (spaced repetition) nie jest wykorzystywana w pełni. Fiszki AI ma za zadanie wyeliminować tę barierę, umożliwiając generowanie kandydatów na fiszki na podstawie wprowadzonego tekstu, co skraca czas potrzebny na przygotowanie materiałów edukacyjnych.

## 3. Wymagania funkcjonalne
1. Generowanie fiszek przez AI:
   - Użytkownik może wkleić tekst o maksymalnej długości od 1000 do 10 000 znaków.
   - Aplikacja wysyła tekst do modelu LLM za pośrednictwem API.
   - AI generuje kandydatów na fiszki na podstawie wprowadzonego tekstu.
   - Użytkownik ma możliwość akceptacji, edycji lub odrzucenia wygenerowanych fiszek.

2. Manualne tworzenie fiszek:
   - Użytkownik może samodzielnie tworzyć fiszki (przód i tył).

3. Przeglądanie, edycja i usuwanie fiszek:
   - Użytkownik ma dostęp do listy wszystkich fiszek zapisanych na swoim koncie w widoku "Moje fiszki".
   - Możliwość edycji treści fiszek.
   - Opcja usuwania niepotrzebnych fiszek.

4. System kont użytkowników:
   - Rejestracja i logowanie użytkowników za pomocą e-maila i hasła.
   - Moliwość zmiany hasła i usunięcia konta.
   - Przechowywanie fiszek przypisanych do danego konta.

5. Integracja z algorytmem powtórek:
   - Zaakceptowane fiszki są przekazywane do gotowego, zewnętrznego algorytmu powtóre (open-source).

6. Prowadzenie logów:
   - Zapisywanie podstawowych informacji, takich jak czas wygenerowania, ID użytkownika i status (akceptacja/odrzucenie).

7. Wymagania prawne:
   - Dane osobowe zgodnie z RODO.
   - Prawo do wglądu i usunięcie danych na wniosek uzytkownika.

## 4. Granice produktu
1. Nie wchodzi w zakres MVP:
   - Własny, zaawansowany algorytm powtórek (np. SuperMemo, Anki), korzystamy z gotowego roziązania open-source.
   - Importowanie plików z formatów takich jak PDF, DOCX, itp.
   - Współdzielenie zestawów fiszek między użytkownikami.
   - Integracje z innymi platformami edukacyjnymi.
   - Aplikacje mobilne – na początek wspierany jest wyłącznie interfejs webowy.

2. Dodatkowe ograniczenia ustalone podczas planowania:
   - Maksymalna długość wklejanego tekstu wynosi 10 000 znaków.
   - Obsługiwany jest wyłącznie jeden język bez zaawansowanej personalizacji treści.
   - Uwierzytelnianie ogranicza się do prostego logowania (e-mail i hasło).
   - Logi zawierają jedynie podstawowe informacje, bez zaawansowanej analityki czy mechanizmów bezpieczeństwa.

## 5. Historyjki użytkowników

US-001  
Tytuł: Rejestracja i logowanie  
Opis: Jako użytkownik chcę móc się zarejestrować oraz zalogować przy użyciu e-maila i hasła, aby mieć dostęp do moich fiszek.  
Kryteria akceptacji:
- Użytkownik musi móc utworzyć konto podając poprawny adres e-mail i hasło.
- Po rejestracji użytkownik może zalogować się i uzyskać dostęp do osobistej bazy fiszek.
- Walidacja danych wejściowych musi zapobiegać rejestracji niepoprawnych kont.
- Dane logowania przechowywane w bezpieczny sposób.

US-002  
Tytuł: Wklejanie tekstu do generowania fiszek  
Opis: Jako użytkownik chcę móc wkleić tekst (do 10 000 znaków) do aplikacji, aby AI mogło wygenerować na jego podstawie fiszki.  
Kryteria akceptacji:
- Tekst wprowadzony przez użytkownika musi być walidowany pod kątem długości (maksymalnie 10 000 znaków).
- Po wklejeniu tekstu użytkownik ma możliwość uruchomienia procesu generowania fiszek przez AI.

US-003  
Tytuł: Generowanie fiszek przez AI  
Opis: Jako użytkownik chcę, aby system generował kandydatów na fiszki na podstawie wprowadzonego tekstu, abym mógł zaoszczędzić czas na tworzenie materiałów edukacyjnych.  
Kryteria akceptacji:
- AI generuje listę fiszek na podstawie dostarczonego tekstu.
- Każda wygenerowana fiszka powinna zawierać podstawowe informacje (np. przód i sugerowany tył).
- Użytkownik otrzymuje informację, gdy lista fiszek jest gotowa do przeglądu.

US-004  
Tytuł: Akceptacja, edycja lub odrzucenie fiszek wygenerowanych przez AI  
Opis: Jako użytkownik chcę móc akceptować, edytować lub odrzucać fiszki wygenerowane przez AI, aby tylko te trafne były zapisane w mojej bazie.  
Kryteria akceptacji:
- Użytkownik widzi listę wygenerowanych fiszek.
- Przy każdej fiszce dostępne są opcje: akceptacji, edycji lub odrzucenia.
- Po akceptacji fiszka zostaje zapisana w bazie danych i przekazana do algorytmu powtórek.

US-005  
Tytuł: Manualne tworzenie fiszek  
Opis: Jako użytkownik chcę móc samodzielnie tworzyć fiszki, wpisując treść pytania i odpowiedzi, co umożliwia uzupełnienie brakujących materiałów lub modyfikację istniejących.  
Kryteria akceptacji:
- Użytkownik ma dostęp do formularza umożliwiającego wpisanie treści fiszki - "Przód" raz "Tył".
- Utworzone fiszki są zapisywane w bazie danych przypisanej do konta użytkownika.
- Ekran edycji pozwala na późniejszą modyfikację manualnie utworzonych fiszek.

US-006  
Tytuł: Przeglądanie, edycja i usuwanie fiszek  
Opis: Jako użytkownik chcę móc przeglądać wszystkie moje fiszki, a także edytować lub usuwać te, które są nieaktualne lub niepotrzebne.  
Kryteria akceptacji:
- Użytkownik widzi listę wszystkich fiszek przypisanych do jego konta.
- Dla każdej fiszki dostępne są opcje edycji i usunięcia.
- Po edycji lub usunięciu zmiany są odzwierciedlane w bazie danych.

US-007  
Tytuł: Sesja nauki z algorytmem powtórek  
Opis: Jako użytkownik chcę, aby zaakceptowane fiszki były automatycznie integrowane z zewnętrznym algorytmem powtórek, abym mógł korzystać z metod spaced repetition.  
Kryteria akceptacji:
- W widoku "Sesja nauki" algorytm przygotowuje dla mnie sesje nauki fiszek.
- Na start wyświetlany jest przód fiszki, poprzez interakcję uytkownik wyświetla jej tył
- Uzytkownik ocenia zgodnie z oczekiwaniami algorytmu na ile przyswoił fiszkę.
- Następnie algorytm pokazuje kolejną fiszkę w ramach sesji nauki.
- Ewentualne błędy integracji są logowane w systemie.

US-008  
Tytuł: Walidacja i logowanie zdarzeń  
Opis: Jako administrator systemu chcę, aby generowane akcje (takie jak generowanie, akceptacja czy odrzucenie fiszek) były logowane wraz z podstawowymi informacjami, aby móc monitorować działanie aplikacji.  
Kryteria akceptacji:
- Każda operacja generowania fiszek musi być logowana (czas, ID użytkownika, status operacji).
- Logi są przechowywane w bazie danych.
- Informacje logów nie zawierają wrażliwych danych osobowych i są zgodne z przyjętymi standardami bezpieczeństwa.

## 6. Metryki sukcesu
1. Co najmniej 75% fiszek wygenerowanych przez AI zostaje zaakceptowanych przez użytkowników.
2. Użytkownicy tworzą 75% wszystkich fiszek z wykorzystaniem funkcji generowania przez AI (mierzone za pomocą logów w bazie danych).
3. Wysoki wskaźnik akceptacji pokazywany generowanej listy kandydatów na fiszki (operacja akceptacji, edycji lub odrzucenia musi być intuicyjna i szybka).
```