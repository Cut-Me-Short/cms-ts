// Re-export base error and handler for convenience
export { CMSAPIError } from "./base";
export { handleApiError } from "../errors";

// Specific error types
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
} from "./specific";
