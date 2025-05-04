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
    
    // Path to the server entry file in the build output
    const serverEntryPath = path.resolve(__dirname, '../dist/server/entry.mjs');
    
    if (!fs.existsSync(serverEntryPath)) {
      console.error('Server entry file not found at:', serverEntryPath);
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

main();