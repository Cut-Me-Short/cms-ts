/**
 * Input validation schemas using Zod
 * Ensures all incoming data is sanitized and valid
 */
import { z } from "zod";
import {
  VALIDATION_CONSTRAINTS,
  ERROR_MESSAGES,
  SENSITIVE_FIELDS,
} from "../constants/constants";

export const CMSConfigSchema = z.object({
  apiKey: z
    .string()
    .optional(),
  timeout: z
    .number()
    .int()
    .min(VALIDATION_CONSTRAINTS.TIMEOUT.MIN_MS, ERROR_MESSAGES.TIMEOUT_TOO_LOW)
    .max(VALIDATION_CONSTRAINTS.TIMEOUT.MAX_MS, ERROR_MESSAGES.TIMEOUT_TOO_HIGH)
    .optional(),
  maxRetries: z
    .number()
    .int()
    .min(VALIDATION_CONSTRAINTS.MAX_RETRIES.MIN, ERROR_MESSAGES.MAX_RETRIES_NEGATIVE)
    .max(VALIDATION_CONSTRAINTS.MAX_RETRIES.MAX, ERROR_MESSAGES.MAX_RETRIES_TOO_HIGH)
    .optional(),
  retryDelayMs: z
    .number()
    .int()
    .min(VALIDATION_CONSTRAINTS.RETRY_DELAY.MIN_MS, ERROR_MESSAGES.RETRY_DELAY_TOO_LOW)
    .max(VALIDATION_CONSTRAINTS.RETRY_DELAY.MAX_MS, ERROR_MESSAGES.RETRY_DELAY_TOO_HIGH)
    .optional(),
  retryMaxDelayMs: z
    .number()
    .int()
    .min(VALIDATION_CONSTRAINTS.RETRY_MAX_DELAY.MIN_MS, ERROR_MESSAGES.RETRY_MAX_DELAY_TOO_LOW)
    .max(VALIDATION_CONSTRAINTS.RETRY_MAX_DELAY.MAX_MS, ERROR_MESSAGES.RETRY_MAX_DELAY_TOO_HIGH)
    .optional(),
  retryOnStatuses: z
    .array(z.number().int().min(100).max(599))
    .optional(),
  retryOnNetworkError: z.boolean().optional(),
});

export type CMSConfigInput = z.infer<typeof CMSConfigSchema>;

// Lead payload validation
export const LeadPayloadSchema = z.object({
  clickId: z
    .string()
    .min(VALIDATION_CONSTRAINTS.STRING_FIELDS.CLICK_ID.MIN)
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CLICK_ID.MAX)
    .optional(),
  eventName: z
    .string()
    .min(VALIDATION_CONSTRAINTS.STRING_FIELDS.EVENT_NAME.MIN, ERROR_MESSAGES.EVENT_NAME_REQUIRED)
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.EVENT_NAME.MAX, ERROR_MESSAGES.EVENT_NAME_TOO_LONG),
  customerExternalId: z
    .string()
    .min(VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_EXTERNAL_ID.MIN, ERROR_MESSAGES.CUSTOMER_EXTERNAL_ID_REQUIRED)
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_EXTERNAL_ID.MAX, ERROR_MESSAGES.CUSTOMER_EXTERNAL_ID_TOO_LONG),
  timestamp: z
    .string()
    .datetime()
    .optional(),
  customerId: z
    .string()
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_ID.MAX)
    .optional(),
  customerName: z
    .string()
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_NAME.MAX)
    .optional(),
  customerEmail: z
    .string()
    .email(ERROR_MESSAGES.CUSTOMER_EMAIL_INVALID)
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_EMAIL.MAX, ERROR_MESSAGES.CUSTOMER_EMAIL_TOO_LONG)
    .optional(),
  customerAvatar: z
    .string()
    .url(ERROR_MESSAGES.CUSTOMER_AVATAR_INVALID)
    .optional(),
  mode: z
    .enum(["deferred"])
    .optional(),
});

export type LeadPayloadInput = z.infer<typeof LeadPayloadSchema>;

// Sale payload validation
export const SalePayloadSchema = z.object({
  clickId: z
    .string()
    .min(VALIDATION_CONSTRAINTS.STRING_FIELDS.CLICK_ID.MIN)
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CLICK_ID.MAX)
    .optional(),
  eventName: z
    .string()
    .optional(),
  invoiceId: z
    .string()
    .min(VALIDATION_CONSTRAINTS.STRING_FIELDS.INVOICE_ID.MIN, ERROR_MESSAGES.INVOICE_ID_REQUIRED)
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.INVOICE_ID.MAX, ERROR_MESSAGES.INVOICE_ID_TOO_LONG),
  amount: z
    .number()
    .int()
    .min(VALIDATION_CONSTRAINTS.AMOUNT.MIN, ERROR_MESSAGES.AMOUNT_NEGATIVE),
  currency: z
    .string()
    .length(VALIDATION_CONSTRAINTS.CURRENCY.LENGTH, ERROR_MESSAGES.CURRENCY_INVALID_LENGTH)
    .regex(VALIDATION_CONSTRAINTS.CURRENCY.PATTERN, ERROR_MESSAGES.CURRENCY_INVALID_FORMAT)
    .optional(),
  timestamp: z
    .string()
    .datetime()
    .optional(),
  customerId: z
    .string()
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_ID.MAX)
    .optional(),
  customerExternalId: z
    .string()
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_EXTERNAL_ID.MAX)
    .optional(),
  customerName: z
    .string()
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_NAME.MAX)
    .optional(),
  customerEmail: z
    .string()
    .email(ERROR_MESSAGES.CUSTOMER_EMAIL_INVALID)
    .max(VALIDATION_CONSTRAINTS.STRING_FIELDS.CUSTOMER_EMAIL.MAX, ERROR_MESSAGES.CUSTOMER_EMAIL_TOO_LONG)
    .optional(),
  mode: z
    .enum(["deferred"])
    .optional(),
});

export type SalePayloadInput = z.infer<typeof SalePayloadSchema>;

/**
 * Validates input data and throws detailed error if invalid
 */
export function validateLeadPayload(data: unknown): LeadPayloadInput {
  return LeadPayloadSchema.parse(data);
}

export function validateSalePayload(data: unknown): SalePayloadInput {
  return SalePayloadSchema.parse(data);
}

export function validateCMSConfig(data: unknown): CMSConfigInput {
  return CMSConfigSchema.parse(data);
}

/**
 * Sanitizes sensitive data for logging/errors
 * Removes API keys, tokens, and other credentials
 */
export function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForLogging(item));
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Mask sensitive field names
    if (SENSITIVE_FIELDS.PATTERNS.some((field) => lowerKey.includes(field))) {
      sanitized[key] = typeof value === "string" ? SENSITIVE_FIELDS.REDACTION_PLACEHOLDER : value;
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Redacts API key from error messages
 */
export function redactApiKey(message: string, apiKey?: string): string {
  if (!apiKey) return message;
  
  // Replace the full key and common patterns
  const patterns = [
    apiKey,
    apiKey.substring(0, 3) + "***" + apiKey.substring(apiKey.length - 3),
  ];

  let result = message;
  for (const pattern of patterns) {
    result = result.replace(new RegExp(pattern, "g"), SENSITIVE_FIELDS.API_KEY_REDACTION);
  }

  return result;
}
