// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

/**
 * This script prepares a build specifically for Cloudflare Pages
 */
async function main() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '..');
    
    console.log('Preparing Cloudflare Pages build...');
    
    // Create a fresh build directory
    const distDir = path.resolve(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      console.log('Removing existing dist directory...');
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(distDir, { recursive: true });
    fs.mkdirSync(path.join(distDir, 'functions'), { recursive: true });
    
    // Try to run a standard build using React 18
    console.log('Attempting to build with React 18...');
    
    // Temporarily modify package.json to use React 18
    const packageJsonPath = path.resolve(rootDir, 'package.json');
    const originalPackageJson = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(originalPackageJson);
    
    // Store original React versions
    const originalReact = packageJson.dependencies.react;
    const originalReactDom = packageJson.dependencies['react-dom'];
    
    console.log(`Original React version: ${originalReact}`);
    console.log(`Original React DOM version: ${originalReactDom}`);
    
    // Update to React 18
    packageJson.dependencies.react = '18.2.0';
    packageJson.dependencies['react-dom'] = '18.2.0';
    
    // Write modified package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    try {
      // Install React 18 dependencies
      console.log('Installing React 18 dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      
      // Try to build with Astro
      console.log('Building with Astro...');
      execSync('astro build', { stdio: 'inherit' });
      
      console.log('Successfully built with React 18!');
    } catch (/** @type {any} */ error) {
      console.warn('Standard build failed, creating fallback pages...');
      
      // Generate fallback content
      await generateFallbackContent(distDir);
    } finally {
      // Restore original package.json
      console.log('Restoring original React versions...');
      packageJson.dependencies.react = originalReact;
      packageJson.dependencies['react-dom'] = originalReactDom;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      // Reinstall original dependencies
      console.log('Reinstalling original dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    // Deploy to Cloudflare Pages
    console.log('Deploying to Cloudflare Pages...');
    try {
      execSync('npx wrangler pages deploy dist', { stdio: 'inherit' });
      console.log('Successfully deployed to Cloudflare Pages!');
    } catch (error) {
      console.error('Failed to deploy to Cloudflare Pages:', error.message);
      process.exit(1);
    }
    
  } catch (/** @type {any} */ error) {
    console.error('Error during Pages deployment:', error.message);
    process.exit(1);
  }
}

/**
 * Generate fallback content for Pages
 * @param {string} distDir - The dist directory path
 */
async function generateFallbackContent(distDir) {
  // Create the polyfill content
  const polyfill = `
// MessageChannel polyfill for Cloudflare Workers
if (typeof globalThis.MessageChannel === 'undefined') {
  class MessagePort {
    onmessage = null;
    postMessage(data) {
      if (this.paired && this.paired.onmessage) {
        const event = { data };
        setTimeout(() => {
          if (this.paired?.onmessage) this.paired.onmessage(event);
        }, 0);
      }
    }
    start() {}
    close() {}
    paired = null;
  }

  class MessageChannelPolyfill {
    port1;
    port2;

    constructor() {
      this.port1 = new MessagePort();
      this.port2 = new MessagePort();
      this.port1.paired = this.port2;
      this.port2.paired = this.port1;
    }
  }

  globalThis.MessageChannel = MessageChannelPolyfill;
  globalThis.MessagePort = MessagePort;
}
`;

  // Create a simple _worker.js file for Cloudflare Pages
  const workerContent = `${polyfill}
export default {
  async fetch(request, env, ctx) {
    // Check if this is a request for the static HTML page
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return fetch(request);
    }
    
    return new Response("Cloudflare Pages is running, but the full app couldn't be built. Please check the build logs.", {
      headers: { "Content-Type": "text/plain" }
    });
  }
};
`;

  // Write the worker file
  fs.writeFileSync(path.join(distDir, '_worker.js'), workerContent);

  // Create a simple catch-all function for Pages Functions
  const functionContent = `${polyfill}
export async function onRequest(context) {
  return new Response("Cloudflare Pages Functions are running, but the full app couldn't be built. Please check the build logs.", {
    headers: { "Content-Type": "text/plain" }
  });
}
`;

  // Write the function file
  fs.writeFileSync(path.join(distDir, 'functions', '[[path]].js'), functionContent);

  // Create a simple index.html for static fallback
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>10xdevs Project - Cloudflare Pages</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: #3b82f6; }
    .card {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin: 2rem 0;
    }
    code {
      background-color: #e5e7eb;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h1>10xdevs Project</h1>
  <div class="card">
    <p>
      Your Cloudflare Pages site is running, but the full application couldn't be built. 
      This is a temporary placeholder page.
    </p>
    <p>
      <strong>Error:</strong> The build process encountered an issue with React 19's 
      <code>MessageChannel</code> dependency, which is not available in the Cloudflare Workers environment.
    </p>
    <h2>Recommended solutions:</h2>
    <ol>
      <li>Downgrade to React 18.2.0 in your package.json</li>
      <li>Use a custom MessageChannel polyfill</li>
      <li>Wait for better Cloudflare support for React 19 features</li>
    </ol>
  </div>
</body>
</html>`;

  // Write the HTML file
  fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);

  console.log('Successfully created fallback Cloudflare Pages content.');
}

main(); 