import type {
  ModelParams,
  OpenRouterConfig,
  ChatResponse,
  Message,
  ApiRequestPayload,
  OpenRouterApiResponse,
} from "./openrouter.types";
import {
  responseFormatSchema,
  configSchema,
  messageSchema,
  chatResponseSchema,
  OpenRouterError,
  OpenRouterValidationError,
  OpenRouterApiError,
  DEFAULT_CONFIG,
} from "./openrouter.types";

export class OpenRouterService {
  readonly #config: OpenRouterConfig;
  readonly #baseUrl: string;
  readonly #retryDelay = 1000;
  readonly #requestTimeout: number;
  readonly #rateLimitDelay: number;
  readonly #maxRetries: number;

  #lastRequestTime = 0;

  constructor(config: Partial<OpenRouterConfig> = {}) {
    try {
      // Ensure API key is provided
      if (!config.apiKey || config.apiKey.trim() === "") {
        throw new OpenRouterValidationError("API key is required. Actual value: " + config.apiKey);
      }

      // Merge provided config with defaults
      const fullConfig: OpenRouterConfig = {
        apiKey: config.apiKey,
        modelName: DEFAULT_CONFIG.modelName,
        modelParameters: DEFAULT_CONFIG.modelParameters,
        requestTimeout: DEFAULT_CONFIG.requestTimeout,
        rateLimitDelay: DEFAULT_CONFIG.rateLimitDelay,
        maxRetries: DEFAULT_CONFIG.maxRetries,
        ...config,
      };

      const validatedConfig = configSchema.parse(fullConfig);

      this.#config = validatedConfig;
      this.#baseUrl = validatedConfig.baseUrl || "https://openrouter.ai/api/v1";
      this.#requestTimeout = validatedConfig.requestTimeout || DEFAULT_CONFIG.requestTimeout;
      this.#rateLimitDelay = validatedConfig.rateLimitDelay || DEFAULT_CONFIG.rateLimitDelay;
      this.#maxRetries = validatedConfig.maxRetries || DEFAULT_CONFIG.maxRetries;
    } catch (error) {
      throw new OpenRouterValidationError(
        "Invalid configuration provided. Please ensure your OpenRouter API key is set correctly."
      );
    }
  }

  // Public methods
  public async sendChatMessage(systemMessage: string, userMessage: string): Promise<ChatResponse> {
    try {
      // Validate messages
      const messages: Message[] = [
        messageSchema.parse({ role: "system", content: systemMessage }),
        messageSchema.parse({ role: "user", content: userMessage }),
      ];

      const payload = this.#preparePayload(messages);
      return await this.#sendRequest(payload);
    } catch (error) {
      this.#logError(error);
      if (error instanceof OpenRouterError) {
        throw error;
      }
      throw new OpenRouterError("Failed to send chat message");
    }
  }

  public setModelParameters(params: Partial<ModelParams>): void {
    try {
      const currentParams = this.#config.modelParameters;
      const newParams = { ...currentParams, ...params };
      const validatedParams = configSchema.shape.modelParameters.parse(newParams);
      this.#config.modelParameters = validatedParams;
    } catch (error) {
      throw new OpenRouterValidationError("Invalid model parameters provided");
    }
  }

  public getResponseFormat(): typeof responseFormatSchema {
    return responseFormatSchema;
  }

  // Private methods
  #preparePayload(messages: Message[]): ApiRequestPayload {
    return {
      model: this.#config.modelName,
      messages,
      ...this.#config.modelParameters,
      response_format: responseFormatSchema,
    };
  }

  async #sendRequest(payload: ApiRequestPayload, retryCount = 0): Promise<ChatResponse> {
    try {
      // Verify API key is available before making request
      if (!this.#config.apiKey || this.#config.apiKey.trim() === "") {
        throw new OpenRouterError("API key is required to make requests to OpenRouter API");
      }
      
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.#lastRequestTime;
      if (timeSinceLastRequest < this.#rateLimitDelay) {
        await new Promise((resolve) => setTimeout(resolve, this.#rateLimitDelay - timeSinceLastRequest));
      }
      this.#lastRequestTime = Date.now();

      // Request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.#requestTimeout);

      // Use fetch directly in Cloudflare Workers environment
      const response = await fetch(`${this.#baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.#config.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        const isRetryable = response.status >= 500 || response.status === 429;

        if (isRetryable && retryCount < this.#maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff with max 10s
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.#sendRequest(payload, retryCount + 1);
        }

        throw new OpenRouterApiError(`API request failed with status ${response.status}`, response.status, errorData);
      }

      const data = await response.json();

      // Log the raw response for debugging
      console.log("OpenRouter API Response:", JSON.stringify(data, null, 2));

      // Validate response
      try {
        const validatedResponse = chatResponseSchema.parse(data) as OpenRouterApiResponse;

        // Parse the content as JSON to get our expected format
        const content = validatedResponse.choices?.[0]?.message?.content;
        if (!content) {
          throw new OpenRouterValidationError("No content in API response choices");
        }

        try {
          const parsedContent = JSON.parse(content);
          console.log("Parsed content:", JSON.stringify(parsedContent, null, 2));

          if (!parsedContent.answer || !Array.isArray(parsedContent.answer)) {
            throw new OpenRouterValidationError('Response content missing required "answer" array');
          }

          if (typeof parsedContent.confidence !== "number") {
            throw new OpenRouterValidationError('Response content missing required "confidence" number');
          }

          // Validate each flashcard in the answer array
          for (const [index, card] of parsedContent.answer.entries()) {
            if (!card.front || typeof card.front !== "string") {
              throw new OpenRouterValidationError(`Flashcard at index ${index} missing required "front" string`);
            }
            if (!card.back || typeof card.back !== "string") {
              throw new OpenRouterValidationError(`Flashcard at index ${index} missing required "back" string`);
            }
          }

          return parsedContent as ChatResponse;
        } catch (parseError) {
          if (parseError instanceof OpenRouterValidationError) {
            throw parseError;
          }
          throw new OpenRouterValidationError(`Failed to parse response content as JSON: ${parseError}`);
        }
      } catch (error) {
        if (error instanceof OpenRouterValidationError) {
          throw error;
        }
        throw new OpenRouterValidationError(`Invalid response format received from API: ${error}`);
      }
    } catch (error: unknown) {
      if (error instanceof OpenRouterError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        if (retryCount < this.#maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.#sendRequest(payload, retryCount + 1);
        }
        throw new OpenRouterError("Request timeout after max retries");
      }

      // Handle any other errors
      throw new OpenRouterError(`Failed to send request to OpenRouter API: ${error}`);
    }
  }

  #logError(error: unknown): void {
    console.error("[OpenRouterService] Error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      modelName: this.#config.modelName,
      ...(error instanceof OpenRouterApiError && {
        status: error.status,
        response: error.response,
      }),
    });
  }
}
