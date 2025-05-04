// MessageChannel polyfill for Cloudflare Workers
if (typeof globalThis.MessageChannel === 'undefined') {
  class MessagePort {
    onmessage: ((this: MessagePort, ev: MessageEvent) => any) | null = null;
    postMessage(data: any) {
      if (this.paired && this.paired.onmessage) {
        const event = new MessageEvent('message', { data });
        setTimeout(() => {
          if (this.paired?.onmessage) this.paired.onmessage(event);
        }, 0);
      }
    }
    start() {}
    close() {}
    paired: MessagePort | null = null;
  }

  class MessageChannelPolyfill {
    port1: MessagePort;
    port2: MessagePort;

    constructor() {
      this.port1 = new MessagePort();
      this.port2 = new MessagePort();
      this.port1.paired = this.port2;
      this.port2.paired = this.port1;
    }
  }

  globalThis.MessageChannel = MessageChannelPolyfill as any;
  globalThis.MessagePort = MessagePort as any;
}

export {}; 