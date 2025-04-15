import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const DEFAULT_USER_ID = 'default-user-id';
export type AppSupabaseClient = SupabaseClient<Database>;

export const supabaseClient: AppSupabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey); 