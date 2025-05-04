import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class EditFlashcardDialogPage {
  constructor(private page: Page) {}

  // Actions
  async editFront(text: string) {
    await this.page.getByTestId("edit-front-textarea").fill(text);
  }

  async editBack(text: string) {
    await this.page.getByTestId("edit-back-textarea").fill(text);
  }

  async save() {
    await this.page.getByTestId("edit-save-button").click();
  }

  async cancel() {
    await this.page.getByTestId("edit-cancel-button").click();
  }

  // Assertions
  async expectDialogVisible() {
    await expect(this.page.getByTestId("edit-flashcard-dialog")).toBeVisible();
  }

  async expectDialogNotVisible() {
    await expect(this.page.getByTestId("edit-flashcard-dialog")).not.toBeVisible();
  }

  async expectErrorVisible(errorText?: string) {
    const errorAlert = this.page.getByTestId("edit-error-alert");
    await expect(errorAlert).toBeVisible();
    if (errorText) {
      await expect(errorAlert).toContainText(errorText);
    }
  }

  async expectFrontContent(text: string) {
    await expect(this.page.getByTestId("edit-front-textarea")).toHaveValue(text);
  }

  async expectBackContent(text: string) {
    await expect(this.page.getByTestId("edit-back-textarea")).toHaveValue(text);
  }
}
