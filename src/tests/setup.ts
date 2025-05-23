import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Add custom matchers for DOM testing
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});
