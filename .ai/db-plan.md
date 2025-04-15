# Schemat bazy danych PostgreSQL - Fiszki AI

## 1. Tabele i kolumny

### 1.1. Tabela `flashcards`
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL
  - Odniesienie do użytkownika w Supabase Auth
- **front**: VARCHAR(200) NOT NULL
  - Ograniczenie: maksymalnie 200 znaków (CHECK: char_length(front) <= 200)
- **back**: VARCHAR(500) NOT NULL
  - Ograniczenie: maksymalnie 500 znaków (CHECK: char_length(back) <= 500)
- **type**: VARCHAR(10) NOT NULL
  - Dozwolone wartości: 'AI' lub 'manual' (CHECK: type IN ('AI', 'manual'))
- **knowledge_status**: VARCHAR(50) NOT NULL
- **last_review_date**: TIMESTAMP WITH TIME ZONE
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### 1.2. Tabela `generation_error_logs`
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL
  - Odniesienie do użytkownika w Supabase Auth
- **model**: VARCHAR NOT NULL
- **source_text_hash**: VARCHAR NOT NULL
- **source_text_length**: INTEGER NOT NULL CHECK(source_text_length BETWEEN 1000 AND 10000)
- **error_code**: VARCHAR(100) NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### 1.3. Tabela `generation_sessions`
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL
  - Odniesienie do użytkownika w Supabase Auth
- **session_duration**: INTERVAL NOT NULL
- **accepted_count**: INTEGER NULLABLE
- **edited_count**: INTEGER NULLABLE
- **rejected_count**: INTEGER NULLABLE
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

## 2. Relacje między tabelami

- Jeden użytkownik (z Supabase Auth) może posiadać wiele wpisów w tabeli `flashcards` (relacja 1:N przy użyciu `user_id`).
- Jeden użytkownik może posiadać wiele logów w tabeli `generation_error_logs` oraz wiele sesji w tabeli `generation_sessions` (relacja 1:N przy użyciu `user_id`).


## 3. Indeksy

- Indeks na kolumnie `user_id` w tabeli `flashcards` w celu optymalizacji zapytań.
- Indeks na kolumnie `user_id` w tabeli `generation_error_logs`.
- Indeks na kolumnie `user_id` w tabeli `generation_sessions`.

## 4. Zasady PostgreSQL (RLS)

- W tabelach `flashcards`, `generation_error_logs` i `generation_sessions` wdrożone zostaną polityki RLS (Row Level Security) dla ograniczenia dostępu opartego na `user_id`.
  - Przykładowa reguła: dostęp do wiersza przyznawany jest tylko, gdy `user_id` w tabeli odpowiada identyfikatorowi użytkownika z aktualnej sesji (np. używając funkcji `auth.uid()`).

## 5. Dodatkowe uwagi