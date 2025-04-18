-- Migration: Disable all RLS policies
-- Description: Drops all existing RLS policies from tables and disables RLS
-- Author: AI Assistant
-- Date: 2024-03-20

-- Note: Database-level auth.require_role setting has been removed from initial migration
-- as it requires superuser privileges

-- Drop flashcards policies
drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can create their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;

-- Drop generation_error_logs policies
drop policy if exists "Users can view their own error logs" on generation_error_logs;
drop policy if exists "Users can create their own error logs" on generation_error_logs;

-- Drop generation_sessions policies
drop policy if exists "Users can view their own sessions" on generation_sessions;
drop policy if exists "Users can create their own sessions" on generation_sessions;
drop policy if exists "Users can update their own sessions" on generation_sessions;

-- Disable RLS on all tables
alter table flashcards disable row level security;
alter table generation_error_logs disable row level security;
alter table generation_sessions disable row level security; 