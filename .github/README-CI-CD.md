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

# CI/CD Deployment Setup

This project is set up to deploy automatically to Cloudflare Pages when code is pushed to the main branch.

## Required Secrets

The following GitHub secrets need to be configured in your repository settings:

1. `CLOUDFLARE_API_TOKEN` - A Cloudflare API token with "Cloudflare Pages — Edit" permission
2. `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

## Required Environment Variables

The application requires the following environment variables:

```
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_PUBLIC_KEY=your_supabase_anon_key_here
PUBLIC_SUPABASE_URL=your_supabase_url_here
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Application URL
PUBLIC_SITE_URL=https://10xdevs-project.pages.dev
```

These variables should be configured in Cloudflare Pages' environment variables settings.

## How to Generate Cloudflare API Token

1. Log in to the Cloudflare dashboard
2. Go to "My Profile" from the dropdown menu (top right of your dashboard)
3. Select "API Tokens" > "Create Token"
4. Under "Custom Token", select "Get started"
5. Name your API token (e.g., "GitHub Actions Pages Deploy")
6. Under Permissions, add:
   - Account > Cloudflare Pages > Edit
7. Select "Continue to summary" > "Create Token"
8. Copy the generated token and add it as a GitHub secret

## How to Find Your Cloudflare Account ID

1. Log in to the Cloudflare dashboard
2. Your account ID will be visible in the URL:
   `https://dash.cloudflare.com/<ACCOUNT_ID>/pages`
3. Copy this ID and add it as a GitHub secret

## Workflow Details

The deployment workflow:

1. Checks out the code
2. Sets up Node.js according to the `.nvmrc` file
3. Installs dependencies
4. Runs unit tests
5. Builds the application
6. Deploys to Cloudflare Pages

## Setting Up Cloudflare Pages

1. Create a new Pages project in the Cloudflare dashboard
2. Choose "Direct Upload" as the deployment method
3. Set the project name to "10xdevs-project" (or update the workflow accordingly)
4. Configure environment variables in the Pages project settings

## Notes About Cloudflare Pages Deployment

- This project uses the direct Cloudflare Pages Action (cloudflare/pages-action@v1) for deployment
- The build output is in the `dist` directory
- Production deployments are triggered on push to the main branch
- Preview deployments can be set up by modifying the workflow for pull requests
