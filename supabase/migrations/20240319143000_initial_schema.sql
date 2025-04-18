-- Migration: Initial Schema Creation
-- Description: Creates the initial database schema for the Flashcards AI application
-- Tables: flashcards, generation_error_logs, generation_sessions
-- Author: AI Assistant
-- Date: 2024-03-19

-- Step 1: Create functions (before they are needed by triggers)
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Step 2: Create tables with their constraints
create table if not exists flashcards (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    front varchar(200) not null check (char_length(front) <= 200),
    back varchar(500) not null check (char_length(back) <= 500),
    type varchar(10) not null check (type in ('AI', 'manual')),
    knowledge_status varchar(50) not null,
    last_review_date timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

create table if not exists generation_sessions (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    session_duration interval not null,
    accepted_count integer,
    edited_count integer,
    rejected_count integer,
    created_at timestamptz not null default now()
);

-- Step 3: Create triggers
create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Step 4: Create indexes for performance
create index if not exists flashcards_user_id_idx on flashcards(user_id);
create index if not exists generation_error_logs_user_id_idx on generation_error_logs(user_id);
create index if not exists generation_sessions_user_id_idx on generation_sessions(user_id);

-- Step 5: Security setup - enable RLS
alter table flashcards enable row level security;
alter table generation_error_logs enable row level security;
alter table generation_sessions enable row level security;

-- Step 6: Security setup - create RLS policies
-- Flashcards policies
create policy "Users can view their own flashcards"
    on flashcards for select to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own flashcards"
    on flashcards for insert to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on flashcards for update to authenticated
    using (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on flashcards for delete to authenticated
    using (auth.uid() = user_id);

-- Error logs policies
create policy "Users can view their own error logs"
    on generation_error_logs for select to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own error logs"
    on generation_error_logs for insert to authenticated
    with check (auth.uid() = user_id);

-- Session policies
create policy "Users can view their own sessions"
    on generation_sessions for select to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own sessions"
    on generation_sessions for insert to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
    on generation_sessions for update to authenticated
    using (auth.uid() = user_id); 