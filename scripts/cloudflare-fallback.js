// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

/**
 * This is a fallback script for Cloudflare Pages that creates a minimal
 * compatible deployment
 */
async function main() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '..');
    
    console.log('Preparing simplified Cloudflare Pages build...');
    
    // First clean dist directory if it exists
    const distDir = path.resolve(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      console.log('Removing existing dist directory...');
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    
    // Create fresh dist directory
    fs.mkdirSync(distDir, { recursive: true });
    
    // Create functions directory for Pages Functions
    const functionsDir = path.join(distDir, 'functions');
    fs.mkdirSync(functionsDir, { recursive: true });
    
    // Create assets directory for static files
    const assetsDir = path.join(distDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
    
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
    fs.writeFileSync(path.join(functionsDir, '[[path]].js'), functionContent);
    
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
    
    console.log('Successfully created minimal Cloudflare Pages deployment files.');
    console.log('Please deploy these files to Cloudflare Pages, then check your React dependencies.');
    console.log('Consider downgrading to React 18.2.0 in your package.json for Cloudflare compatibility.');
    
  } catch (/** @type {any} */ error) {
    console.error('Error during simplified build:', error.message);
    process.exit(1);
  }
}

main(); 