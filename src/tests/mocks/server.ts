import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create a mock service worker for the Node.js environment
export const server = setupServer(...handlers); 