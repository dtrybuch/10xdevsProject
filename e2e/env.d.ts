/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_PUBLIC_KEY: string;
  readonly E2E_USERNAME: string;
  readonly E2E_PASSWORD: string;
  readonly E2E_USERNAME_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
