// src/client.ts
import { EventsApi, Configuration, TrackLeadRequest, TrackSaleRequest } from "./funcs";
import type { RequestOptions as GeneratedRequestOptions } from "./funcs/base";
import { handleApiError } from "./errors";
import { validateLeadPayload, validateSalePayload, validateCMSConfig } from "./validations/validation";
import { SDK_VERSION, API_CONFIG, RETRY_CONFIG, HTTP_HEADERS } from "./constants/constants";

export type LeadPayload = TrackLeadRequest;
export type SalePayload = TrackSaleRequest;

export interface CMSConfig {
  apiKey: string;
  /** Base URL for the CMS API */
  baseUrl?: string;
  /**
   * Optional timeout in milliseconds for HTTP requests.
   * This is implemented using AbortController around the native fetch API.
   */
  timeout?: number;
  /** Maximum number of retry attempts for transient failures */
  maxRetries?: number;
  /** Base delay (in ms) between retries for transient failures */
  retryDelayMs?: number;
  /** Maximum delay cap (in ms) for retry backoff */
  retryMaxDelayMs?: number;
  /** HTTP status codes that should be retried */
  retryOnStatuses?: number[];
  /** Whether to retry on network errors (no response / timeout) */
  retryOnNetworkError?: boolean;
}

/**
 * Per-request options that can override default SDK configuration
 */
export interface RequestOptions {
  /** Override timeout for this specific request */
  timeout?: number;
  /** Override max retries for this specific request */
  maxRetries?: number;
  /** Override retry delay for this specific request */
  retryDelayMs?: number;
  /** Override retry max delay for this specific request */
  retryMaxDelayMs?: number;
  /** Override retry status codes for this specific request */
  retryOnStatuses?: number[];
  /** Override retry on network error setting for this specific request */
  retryOnNetworkError?: boolean;
}

const DEFAULT_BASE_URL = API_CONFIG.BASE_URL;
const DEFAULT_TIMEOUT_MS = API_CONFIG.TIMEOUT_MS;
const DEFAULT_MAX_RETRIES = RETRY_CONFIG.MAX_RETRIES;
const DEFAULT_RETRY_DELAY_MS = RETRY_CONFIG.DELAY_MS;
const DEFAULT_RETRY_MAX_DELAY_MS = RETRY_CONFIG.MAX_DELAY_MS;
const DEFAULT_RETRY_STATUSES = [...RETRY_CONFIG.ON_STATUSES];

export class CMS {
  public readonly events: EventsApi;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly retryMaxDelayMs: number;
  private readonly retryOnStatuses: Set<number>;
  private readonly retryOnNetworkError: boolean;

  constructor(config: CMSConfig) {
    // Validate configuration with strict schema
    try {
      validateCMSConfig(config);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`CMS SDK: Invalid configuration - ${message}`);
    }

    const basePath = this.normalizeBaseUrl(config.baseUrl ?? DEFAULT_BASE_URL);

    // Retry configuration with sensible defaults
    this.maxRetries = this.resolveNonNegativeInt(config.maxRetries, DEFAULT_MAX_RETRIES, "maxRetries");
    this.retryDelayMs = this.resolvePositiveInt(config.retryDelayMs, DEFAULT_RETRY_DELAY_MS, "retryDelayMs");
    this.retryMaxDelayMs = this.resolvePositiveInt(
      config.retryMaxDelayMs,
      DEFAULT_RETRY_MAX_DELAY_MS,
      "retryMaxDelayMs"
    );
    this.retryOnStatuses = this.resolveRetryStatuses(config.retryOnStatuses ?? DEFAULT_RETRY_STATUSES);
    this.retryOnNetworkError = config.retryOnNetworkError ?? true;

    // Create the Configuration object
    const apiConfig = new Configuration({
      basePath,
      accessToken: config.apiKey,
      baseOptions: {
        // Ensure generated client uses the same timeout & headers
        timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
          'X-CMS-SDK-Version': SDK_VERSION,
          'X-CMS-SDK-Runtime': typeof globalThis !== 'undefined' ? HTTP_HEADERS.RUNTIME_NODEJS : HTTP_HEADERS.RUNTIME_BROWSER,
        },
      },
    });

    // Instantiate the EventsApi using configuration and basePath.
    // The underlying implementation uses the global `fetch` API.
    this.events = new EventsApi(apiConfig, basePath);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private normalizeBaseUrl(baseUrl: string): string {
    try {
      const parsed = new URL(baseUrl);
      return parsed.toString().replace(/\/+$/, "");
    } catch {
      throw new Error("CMS SDK: baseUrl must be a valid absolute URL.");
    }
  }

  private resolveNonNegativeInt(value: number | undefined, fallback: number, key: string): number {
    if (typeof value === "undefined") {
      return fallback;
    }

    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`CMS SDK: ${key} must be a non-negative integer.`);
    }

    return value;
  }

  private resolvePositiveInt(value: number | undefined, fallback: number, key: string): number {
    if (typeof value === "undefined") {
      return fallback;
    }

    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`CMS SDK: ${key} must be a positive integer.`);
    }

    return value;
  }

  private resolveRetryStatuses(statuses: number[]): Set<number> {
    const invalid = statuses.find((status) => !Number.isInteger(status) || status < 100 || status > 599);
    if (typeof invalid !== "undefined") {
      throw new Error("CMS SDK: retryOnStatuses must contain valid HTTP status codes.");
    }

    return new Set(statuses);
  }

  private getHeaderValue(headers: unknown, headerName: string): string | undefined {
    if (!headers) {
      return undefined;
    }

    const normalizedName = headerName.toLowerCase();

    if (headers instanceof Headers) {
      return headers.get(headerName) ?? undefined;
    }

    if (Array.isArray(headers)) {
      const match = headers.find(([key]) => String(key).toLowerCase() === normalizedName);
      return match ? String(match[1]) : undefined;
    }

    if (typeof headers === "object") {
      const entries = Object.entries(headers as Record<string, unknown>);
      const match = entries.find(([key]) => key.toLowerCase() === normalizedName);
      return match ? String(match[1]) : undefined;
    }

    return undefined;
  }

  private parseRetryAfterMs(value: string | undefined): number | undefined {
    if (!value) {
      return undefined;
    }

    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.floor(seconds * 1000);
    }

    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) {
      const diff = timestamp - Date.now();
      if (diff > 0) {
        return Math.floor(diff);
      }
    }

    return undefined;
  }

  private getRetryDelayMs(error: unknown, attempt: number, retryDelayMs: number, retryMaxDelayMs: number): number {
    const responseHeaders = (error as any)?.response?.headers;
    const retryAfterHeader = this.getHeaderValue(responseHeaders, "retry-after");
    const retryAfterMs = this.parseRetryAfterMs(retryAfterHeader);

    if (typeof retryAfterMs === "number") {
      return Math.min(retryAfterMs, retryMaxDelayMs);
    }

    const exponentialBase = Math.min(retryDelayMs * Math.pow(2, Math.max(0, attempt - 1)), retryMaxDelayMs);
    const jitter = Math.floor(Math.random() * Math.max(1, Math.floor(exponentialBase * 0.25)));
    return Math.min(exponentialBase + jitter, retryMaxDelayMs);
  }

  private toGeneratedRequestOptions(options?: RequestOptions): GeneratedRequestOptions | undefined {
    if (!options) {
      return undefined;
    }

    const requestOptions: GeneratedRequestOptions = {};

    if (typeof options.timeout === "number") {
      requestOptions.timeout = options.timeout;
    }

    return requestOptions;
  }

  private async withRetry<T>(fn: () => Promise<T>, options?: RequestOptions): Promise<T> {
    let attempt = 0;

    // Use per-request options if provided, otherwise use instance defaults
    const maxRetries = this.resolveNonNegativeInt(options?.maxRetries, this.maxRetries, "maxRetries");
    const retryDelayMs = this.resolvePositiveInt(options?.retryDelayMs, this.retryDelayMs, "retryDelayMs");
    const retryMaxDelayMs = this.resolvePositiveInt(
      options?.retryMaxDelayMs,
      this.retryMaxDelayMs,
      "retryMaxDelayMs"
    );
    const retryOnStatuses = options?.retryOnStatuses 
      ? this.resolveRetryStatuses(options.retryOnStatuses)
      : this.retryOnStatuses;
    const retryOnNetworkError = options?.retryOnNetworkError ?? this.retryOnNetworkError;

    // attempt 0 + maxRetries additional retries
    // e.g. maxRetries=2 -> attempts: 0,1,2
    const maxAttempts = maxRetries + 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await fn();
      } catch (error) {
        attempt += 1;

        // Check if error is retryable with current settings
        const isRetryable = this.isRetryableErrorWithOptions(
          error,
          retryOnStatuses,
          retryOnNetworkError
        );

        if (attempt >= maxAttempts || !isRetryable) {
          // Final failure, let our error handler wrap it
          return handleApiError(error);
        }

        const delay = this.getRetryDelayMs(error, attempt, retryDelayMs, retryMaxDelayMs);
        await this.sleep(delay);
      }
    }
  }

  private isRetryableErrorWithOptions(
    error: unknown,
    retryOnStatuses: Set<number>,
    retryOnNetworkError: boolean
  ): boolean {
    const axiosError = error as any;

    // Network / timeout errors
    if (retryOnNetworkError && (!axiosError.response || axiosError.code === "ECONNABORTED")) {
      return true;
    }

    // HTTP status based retries
    const status = axiosError.response?.status;
    if (status && retryOnStatuses.has(status)) {
      return true;
    }

    return false;
  }

  async trackLead(leadData: LeadPayload, options?: RequestOptions) {
    // Validate lead data
    try {
      validateLeadPayload(leadData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`CMS SDK: Invalid lead data - ${message}`);
    }

    const requestOptions = this.toGeneratedRequestOptions(options);

    return this.withRetry(
      async () => {
        return this.events.trackLead(leadData, requestOptions);
      },
      options
    );
  }

  async trackSale(saleData: SalePayload, options?: RequestOptions) {
    // Validate sale data
    try {
      validateSalePayload(saleData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`CMS SDK: Invalid sale data - ${message}`);
    }

    const requestOptions = this.toGeneratedRequestOptions(options);

    return this.withRetry(
      async () => {
        return this.events.trackSale(saleData, requestOptions);
      },
      options
    );
  }
}