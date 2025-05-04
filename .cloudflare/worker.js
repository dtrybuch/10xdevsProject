// Polyfill for MessageChannel used by React 19 in Cloudflare Workers
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

// Import the handler - try multiple potential locations
// Use dynamic imports to handle different possible entry points
let handler;

async function loadHandler() {
  try {
    const entryModule = await import('../dist/server/entry.mjs');
    return entryModule.handler;
  } catch (e) {
    console.log('Failed to load server/entry.mjs:', e.message);
    try {
      const workerModule = await import('../dist/_worker.js');
      return workerModule.default?.fetch || workerModule.fetch;
    } catch (e2) {
      console.log('Failed to load _worker.js:', e2.message);
      try {
        const functionsModule = await import('../dist/functions/[[path]].js');
        return functionsModule.handler;
      } catch (e3) {
        console.error('Failed to load any handler module:', e3.message);
        throw new Error('Could not load Astro handler');
      }
    }
  }
}

// Load the handler during initialization
let handlerPromise = loadHandler();

export default {
  async fetch(request, env, ctx) {
    // Ensure our polyfill is loaded
    if (typeof globalThis.MessageChannel === 'undefined') {
      throw new Error('MessageChannel polyfill failed to load');
    }
    
    // Wait for the handler to be loaded
    handler = await handlerPromise;
    return handler(request, env, ctx);
  }
}; 