import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Konfiguracja zmiennych środowiskowych
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Helper function to check for required environment variables
const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is missing`);
  }
  return value;
};

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 60000, // Zwiększamy globalny timeout do 60 sekund
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 30000, // Timeout dla pojedynczych akcji
    navigationTimeout: 30000, // Timeout dla nawigacji
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minuty na uruchomienie serwera
    stdout: "pipe",
    stderr: "pipe",
    env: {
      SUPABASE_URL: getRequiredEnvVar("SUPABASE_URL"),
      SUPABASE_PUBLIC_KEY: getRequiredEnvVar("SUPABASE_PUBLIC_KEY"),
      E2E_USERNAME: getRequiredEnvVar("E2E_USERNAME"),
      E2E_PASSWORD: getRequiredEnvVar("E2E_PASSWORD"),
      E2E_USERNAME_ID: getRequiredEnvVar("E2E_USERNAME_ID"),
      NODE_ENV: "test",
      API_URL: process.env.API_URL || "http://localhost:3000/api",
    },
  },
};

export default config;
