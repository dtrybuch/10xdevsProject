import { test, expect } from "@playwright/test";
import { FlashcardsApp } from "./page-objects/FlashcardsApp";
import { signInWithEmail, signOut, cleanupTestData } from "./helpers/supabase";

test.describe("Flashcards Generation Flow", () => {
  let app: FlashcardsApp;
  let userId: string;

  test.beforeAll(async () => {
    // Check if environment variables are set
    if (!process.env.E2E_USERNAME) throw new Error("E2E_USERNAME env variable is missing");
    if (!process.env.E2E_PASSWORD) throw new Error("E2E_PASSWORD env variable is missing");

    console.log("Starting e2e tests with user:", process.env.E2E_USERNAME);

    try {
      // Zaloguj się przez Supabase i zapisz ID użytkownika
      const username = process.env.E2E_USERNAME;
      const password = process.env.E2E_PASSWORD;
      
      if (!username || !password) {
        throw new Error("Required environment variables are missing");
      }
      
      const authData = await signInWithEmail(username, password);
      userId = authData.user.id;
      console.log("Authentication successful, user ID:", userId);

      // Wyczyść dane testowe przed rozpoczęciem testów
      await cleanupTestData(userId);
    } catch (err) {
      console.error("Error in beforeAll hook:", err);
      throw err;
    } finally {
      try {
        // Wyloguj się, żeby testy mogły się zalogować przez UI
        await signOut();
      } catch (err) {
        console.error("Error signing out in beforeAll:", err);
        // Continue despite sign out errors
      }
    }
  });

  test.beforeEach(async ({ page }) => {
    app = new FlashcardsApp(page);

    // Go to the app page first
    await app.goto();

    try {
      // Logowanie przez UI
      await app.setupAuthenticatedSession();
    } catch (err) {
      console.error("Error in beforeEach during login:", err);
      // Take a screenshot on login failure to help debug
      await page.screenshot({ path: `login-error-${Date.now()}.png` });
      throw err;
    }
  });

  test.afterEach(async () => {
    // Wyczyść dane testowe po każdym teście
    if (userId) {
      try {
        await cleanupTestData(userId);
      } catch (err) {
        console.error("Error cleaning up test data:", err);
        // Continue despite cleanup errors
      }
    }
  });

  test("should generate and manage flashcards", async () => {
    // ARRANGE - przygotowanie tekstu do generowania fiszek
    const sampleText = `
      TypeScript is a programming language developed and maintained by Microsoft. 
      It is a strict syntactical superset of JavaScript and adds optional static typing to the language. 
      It is designed for the development of large applications and transcompiles to JavaScript.
      TypeScript adds additional syntax to JavaScript to support a tighter integration with your editor. 
      Catch errors early in your editor. TypeScript code converts to JavaScript, which runs anywhere JavaScript runs.
      TypeScript understands JavaScript and uses type inference to give you great tooling without additional code.
      TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
      The TypeScript compiler is itself written in TypeScript and compiled to JavaScript.
      The language was created by Anders Hejlsberg, who also developed C# and Delphi.
      TypeScript is an open-source language and is developed on GitHub.
      `.repeat(2); // Powtarzamy tekst, aby osiągnąć minimalną długość 1000 znaków

    // ACT & ASSERT - generowanie fiszek
    await app.generatePage.enterText(sampleText);
    await app.generatePage.expectGenerateButtonEnabled();
    await app.generatePage.clickGenerate();
    await app.generatePage.waitForGeneration();
    await app.generatePage.expectFlashcardsGenerated();

    // Sprawdzenie czy wygenerowano fiszki
    await app.proposalList.expectFlashcardCount(5); // Zakładamy, że generuje się 5 fiszek

    // Akceptowanie wybranych fiszek
    await app.acceptAndSaveFlashcards([0, 2]); // Akceptujemy pierwszą i trzecią fiszkę
  });

  test("should handle validation errors", async () => {
    // Test dla zbyt krótkiego tekstu
    const shortText = "Too short text";
    await app.generatePage.enterText(shortText);
    await app.generatePage.expectGenerateButtonDisabled();

    // Test dla błędów edycji
    const longText = "A".repeat(1500);
    await app.generatePage.enterText(longText);
    await app.generatePage.clickGenerate();
    await app.generatePage.waitForGeneration();

    // Próba edycji z za długim tekstem
    await app.editFlashcard(0, {
      front: "A".repeat(201), // Przekraczamy limit 200 znaków
      back: "Test back",
    });

    // Sprawdzenie czy pojawił się błąd
    await app.editDialog.expectErrorVisible("Front side must not exceed 200 characters");
  });

  test("should handle authentication errors", async ({ page }) => {
    // Tworzymy nową instancję z nową stroną
    const newApp = new FlashcardsApp(page);
    await newApp.goto();

    // Próba logowania z nieprawidłowymi danymi
    await newApp.login("invalid@email.com", "wrongpassword");
    await newApp.loginPage.expectLoginError("Invalid credentials");
  });
});
