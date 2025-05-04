// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * This script injects the MessageChannel polyfill into the Cloudflare entry file
 */
async function main() {
  try {
    // Get current file's directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Possible paths for the server entry file
    const possiblePaths = [
      path.resolve(__dirname, '../dist/server/entry.mjs'),
      path.resolve(__dirname, '../.astro/entry.mjs'),
      path.resolve(__dirname, '../dist/_worker.js'),
      path.resolve(__dirname, '../dist/functions/[[path]].js'),
      path.resolve(__dirname, '../dist/functions/index.js'),
      path.resolve(process.cwd(), 'dist/server/entry.mjs'),
      path.resolve(process.cwd(), '.astro/entry.mjs'),
      path.resolve(process.cwd(), 'dist/_worker.js')
    ];
    
    let serverEntryPath = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        serverEntryPath = possiblePath;
        console.log(`Found server entry file at: ${serverEntryPath}`);
        break;
      }
    }
    
    if (!serverEntryPath) {
      console.error('Server entry file not found in any of the expected locations.');
      console.log('Searched paths:');
      possiblePaths.forEach(p => console.log(` - ${p}`));
      
      // Instead of exiting, try to find files that might be the entry point
      console.log('\nSearching for possible entry files in dist directory...');
      const distDir = path.resolve(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        findEntryFiles(distDir);
      } else {
        console.log('dist directory not found');
      }
      
      process.exit(1);
    }
    
    // Read the current content
    let content = fs.readFileSync(serverEntryPath, 'utf8');
    
    // The polyfill code to inject
    const polyfillCode = `
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
    
    // Inject the polyfill at the beginning of the file
    content = polyfillCode + content;
    
    // Write the updated content back
    fs.writeFileSync(serverEntryPath, content);
    
    console.log('Successfully injected MessageChannel polyfill into server entry file');
  } catch (error) {
    console.error('Error injecting polyfill:', error);
    process.exit(1);
  }
}

/**
 * Helper function to find possible entry files
 * @param {string} dir - Directory to search in
 * @param {number} depth - Current depth in the directory tree
 * @param {number} maxDepth - Maximum depth to search
 */
function findEntryFiles(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return;
  
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        findEntryFiles(filePath, depth + 1, maxDepth);
      } else if (
        file.endsWith('.js') || 
        file.endsWith('.mjs') || 
        file.includes('worker') || 
        file.includes('entry')
      ) {
        console.log(`Possible entry file: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
}

main();