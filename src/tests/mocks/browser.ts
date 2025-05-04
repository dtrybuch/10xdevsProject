import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Create a mock service worker for the browser environment
export const worker = setupWorker(...handlers);

// Function to initialize the MSW worker
export function initMocks() {
  // Start the mock service worker
  worker.start({
    onUnhandledRequest: "bypass",
  });
}
