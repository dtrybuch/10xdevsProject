// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

/**
 * This script builds for Cloudflare and patches the worker file
 */
async function main() {
  try {
    // Run the Astro build
    console.log('Building with Astro...');
    execSync('astro build', { stdio: 'inherit' });
    
    // Get the current directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '..');
    
    // Find the worker file
    const workerFiles = [
      path.resolve(rootDir, 'dist/_worker.js'),
      path.resolve(rootDir, 'dist/server/entry.mjs'),
      path.resolve(rootDir, 'dist/functions/[[path]].js')
    ];
    
    let workerFile = null;
    for (const file of workerFiles) {
      if (fs.existsSync(file)) {
        workerFile = file;
        console.log(`Found worker file at: ${workerFile}`);
        break;
      }
    }
    
    if (!workerFile) {
      console.error('Could not find worker file. Looking for other candidates...');
      const distDir = path.resolve(rootDir, 'dist');
      findPossibleWorkerFiles(distDir);
      process.exit(1);
    }
    
    // Read the worker file
    const originalContent = fs.readFileSync(workerFile, 'utf8');
    
    // Define the polyfill
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
    
    // Write the patched worker file
    const patchedContent = polyfill + originalContent;
    fs.writeFileSync(workerFile, patchedContent);
    
    console.log(`Successfully patched ${workerFile} with MessageChannel polyfill.`);
  } catch (error) {
    console.error('Error during build process:', error);
    process.exit(1);
  }
}

/**
 * Find possible worker files in a directory
 * @param {string} dir - Directory to search
 * @param {number} depth - Current depth
 * @param {number} maxDepth - Maximum depth to search
 */
function findPossibleWorkerFiles(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return;
  
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        findPossibleWorkerFiles(filePath, depth + 1, maxDepth);
      } else if (
        file.endsWith('.js') || 
        file.endsWith('.mjs') || 
        file.includes('worker') || 
        file.includes('entry')
      ) {
        console.log(`Possible worker file: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
}

main(); 