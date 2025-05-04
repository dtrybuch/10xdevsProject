import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class FlashcardProposalListPage {
  constructor(private page: Page) {}

  // Actions
  async acceptFlashcard(index: number) {
    await this.page.getByTestId(`flashcard-proposal-${index}`).getByTestId("accept-flashcard-button").click();
  }

  async editFlashcard(index: number) {
    await this.page.getByTestId(`flashcard-proposal-${index}`).getByTestId("edit-flashcard-button").click();
  }

  async rejectFlashcard(index: number) {
    await this.page.getByTestId(`flashcard-proposal-${index}`).getByTestId("reject-flashcard-button").click();
  }

  async getFlashcardContent(index: number) {
    const flashcard = this.page.getByTestId(`flashcard-proposal-${index}`);
    const front = await flashcard.getByTestId("flashcard-front").textContent();
    const back = await flashcard.getByTestId("flashcard-back").textContent();
    return { front, back };
  }

  // Assertions
  async expectFlashcardCount(count: number) {
    await expect(this.page.getByTestId(/^flashcard-proposal-\d+$/)).toHaveCount(count);
  }

  async expectFlashcardVisible(index: number) {
    await expect(this.page.getByTestId(`flashcard-proposal-${index}`)).toBeVisible();
  }

  async expectFlashcardNotVisible(index: number) {
    await expect(this.page.getByTestId(`flashcard-proposal-${index}`)).not.toBeVisible();
  }

  async expectFlashcardContent(index: number, expectedContent: { front?: string; back?: string }) {
    const flashcard = this.page.getByTestId(`flashcard-proposal-${index}`);
    if (expectedContent.front) {
      await expect(flashcard.getByTestId("flashcard-front")).toContainText(expectedContent.front);
    }
    if (expectedContent.back) {
      await expect(flashcard.getByTestId("flashcard-back")).toContainText(expectedContent.back);
    }
  }

  async expectFlashcardAccepted(index: number) {
    await expect(
      this.page.getByTestId(`flashcard-proposal-${index}`).getByTestId("accept-flashcard-button")
    ).toBeDisabled();
  }
}
