// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

/**
 * This is a fallback script for Cloudflare that avoids file system operations
 * and instead creates files directly
 */
async function main() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '..');
    
    console.log('Preparing simplified Cloudflare build...');
    
    // First clean dist directory if it exists
    const distDir = path.resolve(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      console.log('Removing existing dist directory...');
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    
    // Create fresh dist directory
    fs.mkdirSync(distDir, { recursive: true });
    fs.mkdirSync(path.join(distDir, 'functions'), { recursive: true });
    
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
    
    // Create a simple worker file
    const workerContent = `${polyfill}
export default {
  async fetch(request, env, ctx) {
    return new Response("Cloudflare worker is running, but the full app couldn't be built. Please check the build logs.", {
      headers: { "Content-Type": "text/plain" }
    });
  }
};
`;
    
    // Write the worker file
    fs.writeFileSync(path.join(distDir, '_worker.js'), workerContent);
    
    // Create a simple [[path]].js function
    const functionContent = `${polyfill}
export async function onRequest(context) {
  return new Response("Cloudflare Functions are running, but the full app couldn't be built. Please check the build logs.", {
    headers: { "Content-Type": "text/plain" }
  });
}
`;
    
    // Write the function file
    fs.writeFileSync(path.join(distDir, 'functions', '[[path]].js'), functionContent);
    
    console.log('Successfully created minimal Cloudflare deployment files.');
    console.log('Please deploy these files to Cloudflare, then check your React dependencies.');
    console.log('Consider downgrading to React 18.2.0 in your package.json for Cloudflare compatibility.');
    
  } catch (/** @type {any} */ error) {
    console.error('Error during simplified build:', error.message);
    process.exit(1);
  }
}

main(); 