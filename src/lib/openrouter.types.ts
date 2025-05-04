import { z } from "zod";

export interface ModelParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export interface OpenRouterConfig {
  apiKey: string;
  modelName: string;
  modelParameters: ModelParams;
  baseUrl?: string;
  requestTimeout?: number;
  rateLimitDelay?: number;
  maxRetries?: number;
}

// Default configuration values
export const DEFAULT_CONFIG = {
  modelName: "openai/gpt-3.5-turbo",
  modelParameters: {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
  requestTimeout: 60000, // 60 seconds
  rateLimitDelay: 100, // 100ms between requests
  maxRetries: 3, // Default to 3 retries
} as const;

export interface ChatResponse {
  answer: {
    front: string;
    back: string;
  }[];
  confidence: number;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ApiRequestPayload {
  model: string;
  messages: Message[];
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  response_format: typeof responseFormatSchema;
}

// Custom error types
export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class OpenRouterValidationError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterValidationError";
  }
}

export class OpenRouterApiError extends OpenRouterError {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: unknown
  ) {
    super(message);
    this.name = "OpenRouterApiError";
  }
}

// Response format schema
export const responseFormatSchema = {
  type: "json_schema",
  json_schema: {
    name: "answer",
    schema: {
      type: "object",
      properties: {
        answer: {
          type: "array",
          items: {
            type: "object",
            properties: {
              front: { type: "string" },
              back: { type: "string" },
            },
            required: ["front", "back"],
          },
        },
      },
      required: ["answer"],
    },
  },
} as const;

// Validation schemas
export const configSchema = z.object({
  apiKey: z.string().min(1),
  modelName: z.string().min(1),
  modelParameters: z.object({
    temperature: z.number().min(0).max(1),
    max_tokens: z.number().positive(),
    top_p: z.number().min(0).max(1),
    frequency_penalty: z.number().min(-2).max(2),
    presence_penalty: z.number().min(-2).max(2),
  }),
  baseUrl: z.string().url().optional(),
  requestTimeout: z.number().int().positive().optional(),
  rateLimitDelay: z.number().int().nonnegative().optional(),
  maxRetries: z.number().int().nonnegative().optional(),
});

export const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export const chatResponseSchema = z
  .object({
    id: z.string().optional(),
    model: z.string().optional(),
    created: z.number().optional(),
    object: z.string().optional(),
    choices: z
      .array(
        z.object({
          message: z.object({
            role: z.string(),
            content: z.string(),
          }),
          finish_reason: z.string().optional(),
        })
      )
      .optional()
      .default([]),
  })
  .passthrough();

export type OpenRouterApiResponse = z.infer<typeof chatResponseSchema>;

export interface ChatResponse {
  answer: {
    front: string;
    back: string;
  }[];
  confidence: number;
}
