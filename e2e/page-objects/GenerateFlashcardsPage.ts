import { type Page, expect } from "@playwright/test";

export class GenerateFlashcardsPage {
  constructor(private page: Page) {}

  // Selectors
  private readonly inputTextArea = "data-test-id=input-text-area";
  private readonly generateButton = "data-test-id=generate-flashcards-button";
  private readonly loadingIndicator = "data-test-id=loading-indicator";
  private readonly errorMessage = "data-test-id=error-message";
  private readonly saveButton = "data-test-id=save-flashcards-button";

  // Actions
  async enterText(text: string) {
    try {
      const inputElement = this.page.getByTestId("input-text-area");

      // Wait for element to be attached to DOM
      await inputElement.waitFor({ state: "attached" });

      // Wait for element to be visible
      await inputElement.waitFor({ state: "visible" });

      // Try to focus the element first
      await inputElement.focus();

      // Then fill
      await inputElement.fill(text);
    } catch (error) {
      // Fallback to using role and placeholder
      console.log("Falling back to alternative selector");
      const textbox = this.page.getByRole("textbox", {
        name: "Enter your text here (1,000 - 10,000 characters)",
      });
      await textbox.waitFor({ state: "visible" });
      await textbox.fill(text);
    }
  }

  async clickGenerate() {
    try {
      await this.page.getByTestId("generate-flashcards-button").click();
    } catch (error) {
      // Fallback to role selector
      await this.page.getByRole("button", { name: "Generate Flashcards" }).click();
    }
  }

  async waitForGeneration() {
    try {
      // First check if the page is still available
      if (this.page.isClosed()) {
        throw new Error("Page has been closed");
      }

      // Try with data-test-id first
      try {
        const loadingIndicator = this.page.getByTestId("loading-indicator");
        // Wait for loading indicator to appear and then disappear
        await loadingIndicator.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
          // It's okay if it never becomes visible, it might be already gone
          console.log("Loading indicator not found or already hidden");
        });

        await loadingIndicator.waitFor({ state: "hidden", timeout: 30000 }).catch(() => {
          console.log("Timeout waiting for loading indicator to hide");
        });
      } catch (error: any) {
        // Fallback to any visible loading/spinner elements
        console.log("Using fallback for loading indicator");
        await this.page.waitForTimeout(1000); // Brief pause

        // Check for any spinner or loading text
        const spinner = this.page.getByRole("progressbar");
        if (await spinner.isVisible()) {
          await spinner.waitFor({ state: "hidden", timeout: 30000 }).catch(() => {
            console.log("Timeout waiting for progressbar to hide");
          });
        }
      }
    } catch (error: any) {
      console.log(`Error in waitForGeneration: ${error.message}`);
      // Continue - we'll handle page state in subsequent actions
    }
  }

  async saveSelectedFlashcards() {
    await this.page.getByTestId("save-flashcards-button").click();
  }

  // Assertions
  async expectGenerateButtonEnabled() {
    try {
      // Try test ID first with shorter timeout
      const button = this.page.getByTestId("generate-flashcards-button");
      await button.waitFor({ state: "attached", timeout: 2000 });
      await expect(button).toBeEnabled();
    } catch (error) {
      // Fallback to role selector
      const buttonByRole = this.page.getByRole("button", {
        name: "Generate Flashcards",
      });
      await expect(buttonByRole).toBeVisible();
      await expect(buttonByRole).toBeEnabled();
    }
  }

  async expectGenerateButtonDisabled() {
    try {
      await expect(this.page.getByTestId("generate-flashcards-button")).toBeDisabled();
    } catch (error) {
      await expect(this.page.getByRole("button", { name: "Generate Flashcards" })).toBeDisabled();
    }
  }

  async expectErrorMessageVisible(errorText?: string) {
    const errorElement = this.page.getByTestId("error-message");
    await expect(errorElement).toBeVisible();
    if (errorText) {
      await expect(errorElement).toContainText(errorText);
    }
  }

  async expectFlashcardsGenerated() {
    await expect(this.page.getByTestId("flashcard-proposal-list")).toBeVisible();
  }
}
