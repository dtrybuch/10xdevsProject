# Testing Documentation

This project uses two primary testing approaches:
1. Unit and component testing with Vitest
2. End-to-end testing with Playwright

## Unit Testing with Vitest

### Running Unit Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test File Location

Unit tests should be placed in the same directory as the file they are testing with a `.test.ts` or `.test.tsx` extension, or in the `src/tests/unit` directory.

### Writing Unit Tests

```tsx
// Example component test
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    
    // Use Testing Library queries to find elements
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    
    // Trigger user actions
    await user.click(screen.getByRole('button'));
    
    // Assert the expected result
    expect(screen.getByText('New Text')).toBeInTheDocument();
  });
});
```

### Mocking API Requests

We use MSW (Mock Service Worker) to mock API requests:

```ts
// In your test file
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/tests/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## End-to-End Testing with Playwright

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Generate tests using Playwright codegen
npx playwright codegen http://localhost:4321
```

### Test File Location

E2E tests are located in `src/tests/e2e` directory.

### Writing E2E Tests

```ts
// Example E2E test
import { test, expect } from '@playwright/test';

test('basic navigation flow', async ({ page }) => {
  await page.goto('/');
  
  // Check page content
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  
  // Interact with the page
  await page.getByRole('link', { name: 'Login' }).click();
  
  // Assert navigation
  await expect(page).toHaveURL(/.*login/);
});
```

### Page Object Model (POM)

For more complex tests, use the Page Object Model pattern:

```ts
// src/tests/e2e/models/LoginPage.ts
export class LoginPage {
  constructor(private page) {}
  
  async navigate() {
    await this.page.goto('/login');
  }
  
  async login(email, password) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}

// In your test
import { LoginPage } from './models/LoginPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('user@example.com', 'password');
  
  // Assert successful login
  await expect(page).toHaveURL('/dashboard');
});
```

## Continuous Integration

Tests run automatically in GitHub Actions on pull requests and pushes to main branch. See `.github/workflows` for configuration details. 