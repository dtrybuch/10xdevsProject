# CI/CD Setup

This repository uses GitHub Actions for continuous integration.

## CI Pipeline (`build-main.yml`)

The CI pipeline runs on:

- Every push to the `main` branch
- Every pull request targeting the `main` branch
- Manual triggering via workflow_dispatch

### Jobs:

#### Test Job

1. Check out the repository
2. Set up Node.js using the version from `.nvmrc`
3. Install dependencies with `npm ci`
4. Run linting with `npm run lint`
5. Run unit tests with `npm run test`

#### Build Job

1. Check out the repository
2. Set up Node.js using the version from `.nvmrc`
3. Install dependencies with `npm ci`
4. Build the application with `npm run build`
5. Upload build artifacts for later use

The build job will only run after the test job has completed successfully.

## Local Development

For local development, use:

- `npm run dev` - Start development server
- `npm run test` - Run unit tests
- `npm run lint` - Run linter
- `npm run build` - Build for production
- `npm run preview` - Preview production build
