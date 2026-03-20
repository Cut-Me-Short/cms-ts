import { CMSAPIError } from "./base";

// Re-export CMSAPIError for convenience
export { CMSAPIError };

/**
 * Specific error types for different HTTP status codes.
 * These provide better type safety and allow users to handle specific errors.
 */

export class BadRequestError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 400, "bad_request", rawError);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 401, "unauthorized", rawError);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 403, "forbidden", rawError);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 404, "not_found", rawError);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 409, "conflict", rawError);
    this.name = "ConflictError";
  }
}

export class UnprocessableEntityError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 422, "unprocessable_entity", rawError);
    this.name = "UnprocessableEntityError";
  }
}

export class RateLimitError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 429, "rate_limit_exceeded", rawError);
    this.name = "RateLimitError";
  }
}

export class InternalServerError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 500, "internal_server_error", rawError);
    this.name = "InternalServerError";
  }
}

export class BadGatewayError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 502, "bad_gateway", rawError);
    this.name = "BadGatewayError";
  }
}

export class ServiceUnavailableError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 503, "service_unavailable", rawError);
    this.name = "ServiceUnavailableError";
  }
}

export class GatewayTimeoutError extends CMSAPIError {
  constructor(message: string, rawError?: any) {
    super(message, 504, "gateway_timeout", rawError);
    this.name = "GatewayTimeoutError";
  }
}

/**
 * Maps HTTP status codes to specific error classes
 */
export function createSpecificError(statusCode: number, message: string, rawError?: any): CMSAPIError {
  switch (statusCode) {
    case 400:
      return new BadRequestError(message, rawError);
    case 401:
      return new UnauthorizedError(message, rawError);
    case 403:
      return new ForbiddenError(message, rawError);
    case 404:
      return new NotFoundError(message, rawError);
    case 409:
      return new ConflictError(message, rawError);
    case 422:
      return new UnprocessableEntityError(message, rawError);
    case 429:
      return new RateLimitError(message, rawError);
    case 500:
      return new InternalServerError(message, rawError);
    case 502:
      return new BadGatewayError(message, rawError);
    case 503:
      return new ServiceUnavailableError(message, rawError);
    case 504:
      return new GatewayTimeoutError(message, rawError);
    default:
      return new CMSAPIError(message, statusCode, "api_error", rawError);
  }
}
