/**
 * Centralized constants for the CMS SDK
 * This single source of truth makes it easy to adjust configuration without updating multiple files
 */

// ============================================================================
// SDK VERSION
// ============================================================================
export const SDK_VERSION = "1.0.0";

// ============================================================================
// API CONFIGURATION
// ============================================================================
export const API_CONFIG = {
  /** Default base URL for the CMS API */
  BASE_URL: "https://www.cutmeshort.com",

  /** Default timeout in milliseconds for HTTP requests */
  TIMEOUT_MS: 10_000,
} as const;

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================
export const RETRY_CONFIG = {
  /** Default maximum number of retry attempts for transient failures */
  MAX_RETRIES: 2,

  /** Default base delay (in ms) between retries for transient failures */
  DELAY_MS: 500,

  /** Default maximum delay cap (in ms) for retry backoff */
  MAX_DELAY_MS: 10_000,

  /** HTTP status codes that should be retried by default */
  ON_STATUSES: [429, 500, 502, 503, 504] as const,

  /** Whether to retry on network errors (no response / timeout) by default */
  ON_NETWORK_ERROR: true,
} as const;

// ============================================================================
// VALIDATION CONSTRAINTS
// ============================================================================
export const VALIDATION_CONSTRAINTS = {
  // API Key validation
  API_KEY: {
    /** Regex pattern for valid API keys: must be 20+ alphanumeric chars */
    PATTERN: /^[a-zA-Z0-9_]{20,}$/,
  },

  // Timeout constraints
  TIMEOUT: {
    MIN_MS: 1000,
    MAX_MS: 60000,
  },

  // Max retries constraints
  MAX_RETRIES: {
    MIN: 0,
    MAX: 10,
  },

  // Retry delay constraints
  RETRY_DELAY: {
    MIN_MS: 100,
    MAX_MS: 30000,
  },

  // Retry max delay constraints
  RETRY_MAX_DELAY: {
    MIN_MS: 1000,
    MAX_MS: 120000,
  },

  // String field constraints
  STRING_FIELDS: {
    CLICK_ID: {
      MIN: 1,
      MAX: 255,
    },
    CUSTOMER_ID: {
      MIN: 1,
      MAX: 255,
    },
    CUSTOMER_EXTERNAL_ID: {
      MIN: 1,
      MAX: 255,
    },
    CUSTOMER_NAME: {
      MAX: 255,
    },
    CUSTOMER_EMAIL: {
      MAX: 255,
    },
    EVENT_NAME: {
      MIN: 1,
      MAX: 255,
    },
    INVOICE_ID: {
      MIN: 1,
      MAX: 255,
    },
  },

  // Currency code constraints (ISO 4217)
  CURRENCY: {
    LENGTH: 3,
    PATTERN: /^[A-Z]{3}$/,
  },

  // Amount constraints
  AMOUNT: {
    MIN: 0,
  },
} as const;

// ============================================================================
// ERROR HANDLING
// ============================================================================
export const ERROR_MESSAGES = {
  // API Key errors
  API_KEY_REQUIRED: "apiKey is required",
  API_KEY_INVALID_FORMAT: "apiKey must be a valid API key format",

  // Base URL errors
  BASE_URL_INVALID: "baseUrl must be a valid absolute URL",

  // Timeout errors
  TIMEOUT_TOO_LOW: `timeout must be at least ${VALIDATION_CONSTRAINTS.TIMEOUT.MIN_MS}ms`,
  TIMEOUT_TOO_HIGH: `timeout must not exceed ${VALIDATION_CONSTRAINTS.TIMEOUT.MAX_MS}ms`,

  // Max retries errors
  MAX_RETRIES_NEGATIVE: "maxRetries must be non-negative",
  MAX_RETRIES_TOO_HIGH: `maxRetries must not exceed ${VALIDATION_CONSTRAINTS.MAX_RETRIES.MAX}`,

  // Retry delay errors
  RETRY_DELAY_TOO_LOW: `retryDelayMs must be at least ${VALIDATION_CONSTRAINTS.RETRY_DELAY.MIN_MS}ms`,
  RETRY_DELAY_TOO_HIGH: `retryDelayMs must not exceed ${VALIDATION_CONSTRAINTS.RETRY_DELAY.MAX_MS}ms`,

  // Retry max delay errors
  RETRY_MAX_DELAY_TOO_LOW: `retryMaxDelayMs must be at least ${VALIDATION_CONSTRAINTS.RETRY_MAX_DELAY.MIN_MS}ms`,
  RETRY_MAX_DELAY_TOO_HIGH: `retryMaxDelayMs must not exceed ${VALIDATION_CONSTRAINTS.RETRY_MAX_DELAY.MAX_MS}ms`,

  // Event name errors
  EVENT_NAME_REQUIRED: "eventName is required",
  EVENT_NAME_TOO_LONG: `eventName must not exceed ${VALIDATION_CONSTRAINTS.STRING_FIELDS.EVENT_NAME.MAX} characters`,

  // Customer ID errors
  CUSTOMER_ID_REQUIRED: "customerId is required",
  CUSTOMER_ID_TOO_LONG: `customerId must not exceed ${VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_ID.MAX} characters`,

  // Customer external ID errors
  CUSTOMER_EXTERNAL_ID_REQUIRED: "customerExternalId is required",
  CUSTOMER_EXTERNAL_ID_TOO_LONG: `customerExternalId must not exceed ${VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_EXTERNAL_ID.MAX} characters`,

  // Email errors
  CUSTOMER_EMAIL_INVALID: "customerEmail must be a valid email",
  CUSTOMER_EMAIL_TOO_LONG: `customerEmail must not exceed ${VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_EMAIL.MAX} characters`,

  // Avatar errors
  CUSTOMER_AVATAR_INVALID: "customerAvatar must be a valid URL",

  // Invoice ID errors
  INVOICE_ID_REQUIRED: "invoiceId is required",
  INVOICE_ID_TOO_LONG: `invoiceId must not exceed ${VALIDATION_CONSTRAINTS.STRING_FIELDS.INVOICE_ID.MAX} characters`,

  // Amount errors
  AMOUNT_NEGATIVE: "amount must be non-negative",

  // Currency errors
  CURRENCY_INVALID_LENGTH: `currency must be ${VALIDATION_CONSTRAINTS.CURRENCY.LENGTH}-letter code (e.g., USD)`,
  CURRENCY_INVALID_FORMAT: "currency must be uppercase ISO 4217 code",
  CURRENCY_OPTIONAL_IN_SALE: "currency is optional in sale tracking",
} as const;

// ============================================================================
// HTTP HEADERS
// ============================================================================
export const HTTP_HEADERS = {
  /** Content type for all API requests */
  CONTENT_TYPE: "application/json",

  /** SDK version header key */
  SDK_VERSION_HEADER: "X-CMS-SDK-Version",

  /** SDK runtime detection header key */
  SDK_RUNTIME_HEADER: "X-CMS-SDK-Runtime",

  /** SDK runtime value for Node.js */
  RUNTIME_NODEJS: "nodejs",

  /** SDK runtime value for browser */
  RUNTIME_BROWSER: "browser",
} as const;

// ============================================================================
// SENSITIVE FIELD PATTERNS
// ============================================================================
export const SENSITIVE_FIELDS = {
  /** List of field names that should be redacted in logs */
  PATTERNS: [
    "apiKey",
    "accessToken",
    "token",
    "password",
    "secret",
    "authorization",
    "x-api-key",
  ] as const,

  /** Redaction placeholder */
  REDACTION_PLACEHOLDER: "[REDACTED]",

  /** API key redaction placeholder */
  API_KEY_REDACTION: "[REDACTED_API_KEY]",
} as const;
