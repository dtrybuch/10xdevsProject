# Fiszki AI

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
Fiszki AI is a web application designed to help users quickly create high-quality educational flashcards. The application leverages AI to automatically generate flashcards from user-provided text (up to 10,000 characters) and also supports manual creation, editing, and deletion of flashcards. Additionally, the app integrates with a spaced repetition algorithm to optimize learning and includes a user authentication system (email and password) along with basic logging for key events.

## Tech Stack
**Frontend:**
- Astro 5 for fast, efficient web pages with minimal JavaScript
- React 19 for interactive components
- TypeScript 5 for static typing and enhanced IDE support
- Tailwind CSS 4 for streamlined styling
- Shadcn/ui for accessible React components

**Backend:**
- Supabase for a comprehensive backend solution including PostgreSQL database and built-in authentication

**AI Integration:**
- Openrouter.ai for accessing a range of AI models (OpenAI, Anthropic, Google, etc.) to power flashcard generation

**CI/CD and Hosting:**
- GitHub Actions for CI/CD pipelines
- DigitalOcean with Docker for hosting

**Testing:**
- **Unit & Integration Tests:** Vitest for unit testing, Testing Library for React components, and MSW for API mocking.
- **End-to-End Tests:** Playwright (preferowany) with Cypress as an alternative.

## Getting Started Locally
1. **Prerequisites:**
   - Install [Node.js](https://nodejs.org/) (version as specified in `.nvmrc`: **22.14.0**).
   - Ensure you have npm installed.

2. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd 10xDevsProject
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Additional Configuration:**
   - Set up any necessary environment variables for API keys (e.g., for Openrouter.ai and Supabase).

## Available Scripts
From the `package.json`, the following scripts are available:

- **dev:** Starts the Astro development server (`astro dev`).
- **build:** Builds the project for production (`astro build`).
- **preview:** Serves the production build locally (`astro preview`).
- **astro:** Directly invoke Astro CLI commands.
- **lint:** Runs ESLint to check for code issues (`eslint .`).
- **lint:fix:** Runs ESLint with the fix option (`eslint . --fix`).
- **format:** Formats the code using Prettier (`prettier --write .`).

## Project Scope
The project focuses on delivering an efficient educational tool with the following core functionalities:
- **Flashcard Generation:** Automatically generate flashcards using AI from user-provided text.
- **Manual Flashcard Creation:** Allow users to create flashcards by manually entering the content for the front and back.
- **Flashcard Management:** Enable users to view, edit, and delete flashcards.
- **User Authentication:** Simple registration and login using email and password.
- **Integration with Spaced Repetition:** Accepted flashcards are integrated into an external spaced repetition algorithm.
- **Event Logging:** Log key events (e.g., flashcard generation, acceptance, rejection) along with basic metadata.

## Project Status
This project is currently in active development. 

## License
This project is licensed under the MIT License. 
