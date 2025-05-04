import type { Page } from '@playwright/test';
import { GenerateFlashcardsPage } from './GenerateFlashcardsPage';
import { FlashcardProposalListPage } from './FlashcardProposalListPage';
import { EditFlashcardDialogPage } from './EditFlashcardDialogPage';
import { LoginPage } from './LoginPage';

export class FlashcardsApp {
  readonly generatePage: GenerateFlashcardsPage;
  readonly proposalList: FlashcardProposalListPage;
  readonly editDialog: EditFlashcardDialogPage;
  readonly loginPage: LoginPage;

  constructor(private page: Page) {
    this.generatePage = new GenerateFlashcardsPage(page);
    this.proposalList = new FlashcardProposalListPage(page);
    this.editDialog = new EditFlashcardDialogPage(page);
    this.loginPage = new LoginPage(page);
  }

  // Navigation
  async goto(path = '/') {
    console.log(`Navigating to ${path}`);
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  // Authentication
  async login(email: string, password: string) {
    console.log(`Attempting to log in as ${email}`);
    await this.loginPage.login(email, password);
    
    try {
      await this.loginPage.expectLoggedIn();
      console.log('Login successful');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  // Common workflows
  async setupAuthenticatedSession() {
    console.log('Setting up authenticated session');
    
    // Go to login page
    await this.goto('/login');
    
    // Check if already logged in by looking for user menu
    const userMenuVisible = await this.page.locator('[data-test-id="user-menu"]').isVisible();
    if (userMenuVisible) {
      console.log('Already logged in, skipping login process');
      return;
    }
    
    // Attempt login
    const loginSuccessful = await this.login(
      process.env.E2E_USERNAME!,
      process.env.E2E_PASSWORD!
    );
    
    if (!loginSuccessful) {
      throw new Error('Failed to establish authenticated session');
    }
    
    // Go to generate page after successful login
    await this.goto('/generate');
  }

  async generateFlashcards(text: string) {
    await this.generatePage.enterText(text);
    await this.generatePage.clickGenerate();
    await this.generatePage.waitForGeneration();
  }

  async editFlashcard(index: number, newContent: { front?: string; back?: string }) {
    await this.proposalList.editFlashcard(index);
    await this.editDialog.expectDialogVisible();
    
    if (newContent.front) {
      await this.editDialog.editFront(newContent.front);
    }
    if (newContent.back) {
      await this.editDialog.editBack(newContent.back);
    }
    
    await this.editDialog.save();
    await this.editDialog.expectDialogNotVisible();
  }

  async acceptAndSaveFlashcards(indices: number[]) {
    for (const index of indices) {
      await this.proposalList.acceptFlashcard(index);
      await this.proposalList.expectFlashcardAccepted(index);
    }
    await this.generatePage.saveSelectedFlashcards();
  }
} 