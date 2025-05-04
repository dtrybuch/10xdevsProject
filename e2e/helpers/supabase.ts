import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL is required');
if (!process.env.SUPABASE_PUBLIC_KEY) throw new Error('SUPABASE_PUBLIC_KEY is required');

console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Key length:', process.env.SUPABASE_PUBLIC_KEY.length);

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLIC_KEY
);

export async function signInWithEmail(email: string, password: string) {
  console.log(`Attempting to sign in with email: ${email}`);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    throw error;
  }
  
  console.log('Sign in successful, user ID:', data.user.id);
  return data;
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
      throw error;
    }
    console.log('Sign out successful');
  } catch (err) {
    console.error('Error during sign out:', err);
    // Don't throw here to prevent test failures on sign out issues
  }
}

// Helper do czyszczenia danych testowych
export async function cleanupTestData(userId: string) {
  try {
    console.log(`Cleaning up test data for user: ${userId}`);
    // Usuń wszystkie fiszki utworzone przez użytkownika testowego
    const { error: deleteError } = await supabase
      .from('flashcards')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Cleanup error:', deleteError.message);
      throw deleteError;
    }
    console.log('Test data cleanup successful');
  } catch (err) {
    console.error('Error during test data cleanup:', err);
    // Don't throw here to prevent test failures on cleanup issues
  }
} 