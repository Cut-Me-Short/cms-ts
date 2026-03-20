export { CMS } from "./client";
export type { CMSConfig, RequestOptions, LeadPayload, SalePayload } from "./client";

export { CMSAPIError } from "./errors";
export {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalServerError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  createSpecificError,
} from "./errors/specific";

export { validateLeadPayload, validateSalePayload, validateCMSConfig, sanitizeForLogging } from "./validations/validation";
export type { LeadPayloadInput, SalePayloadInput, CMSConfigInput } from "./validations/validation";

// Export constants for advanced configuration
export {
  SDK_VERSION,
  API_CONFIG,
  RETRY_CONFIG,
  VALIDATION_CONSTRAINTS,
  ERROR_MESSAGES,
  HTTP_HEADERS,
  SENSITIVE_FIELDS,
} from "./constants/constants";