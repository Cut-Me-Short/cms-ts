// src/errors.ts
import { CMSAPIError } from "./errors/base";
import { createSpecificError } from "./errors/specific";
import { sanitizeForLogging, redactApiKey } from "./validations/validation";
export { CMSAPIError };

// Re-export specific error types
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

/**
 * Parses fetch/network errors into a clean CMSAPIError (or specific subclass)
 * Uses specific error types when possible for better type safety
 * Sanitizes sensitive information before storing
 */
export function handleApiError(error: unknown, request?: unknown, response?: unknown): never {
  if (error instanceof CMSAPIError) {
    throw error; // preserve original error metadata/type
  }

  const isHtmlResponse = (data: unknown): boolean => {
    if (typeof data !== "string") return false;
    const trimmed = data.trim().toLowerCase();
    return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html") || trimmed.startsWith("<!-");
  };

  const getBackendErrorMessage = (data: any): string | undefined => {
    const directMessage = typeof data?.message === "string" ? data.message.trim() : "";
    if (directMessage) return directMessage;

    const nestedMessage = typeof data?.error?.message === "string" ? data.error.message.trim() : "";
    if (nestedMessage) return nestedMessage;

    if (Array.isArray(data?.errors)) {
      const firstObjectErrorCode = data.errors.find(
        (item: unknown) => typeof (item as any)?.code === "string" && (item as any).code.trim()
      );
      if (firstObjectErrorCode) {
        return (firstObjectErrorCode as any).code.trim();
      }

      const firstStringError = data.errors.find((item: unknown) => typeof item === "string" && item.trim());
      if (typeof firstStringError === "string") {
        return firstStringError.trim();
      }

      const firstObjectErrorMessage = data.errors.find(
        (item: unknown) => typeof (item as any)?.message === "string" && (item as any).message.trim()
      );
      if (firstObjectErrorMessage) {
        return (firstObjectErrorMessage as any).message.trim();
      }

      const firstObjectErrorText = data.errors.find(
        (item: unknown) =>
          typeof (item as any)?.errorMessage === "string" && (item as any).errorMessage.trim()
      );
      if (firstObjectErrorText) {
        return (firstObjectErrorText as any).errorMessage.trim();
      }
    }

    // Ignore HTML responses (e.g., 404 pages)
    if (typeof data === "string" && data.trim() && !isHtmlResponse(data)) {
      return data.trim();
    }

    return undefined;
  };

  const sanitizeRequest = (req: unknown) => {
    if (!req || typeof req !== "object") return undefined;
    const r = req as Record<string, unknown>;
    
    const sanitized: any = {
      url: typeof r.url === "string" ? r.url : undefined,
      method: typeof r.method === "string" ? r.method : undefined,
      timeout: typeof r.timeout === "number" ? r.timeout : undefined,
    };

    // Only include headers if they don't contain sensitive data
    if (typeof r.headers === "object" && r.headers !== null) {
      const headersObj = r.headers as Record<string, any>;
      const safeHeaders: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(headersObj)) {
        const lowerKey = key.toLowerCase();
        // Exclude authorization and api-key headers
        if (!lowerKey.includes("authorization") && 
            !lowerKey.includes("api-key") && 
            !lowerKey.includes("token")) {
          safeHeaders[key] = value;
        }
      }
      
      if (Object.keys(safeHeaders).length > 0) {
        sanitized.headers = safeHeaders;
      }
    }

    return sanitized;
  };

  // Error with response from server
  const errorWithResponse = (error as any)?.response ?? response;
  if (errorWithResponse) {
    const res = errorWithResponse as any;
    const statusCode = res.status ?? res.statusCode ?? 500;
    const isHtml = isHtmlResponse(res.data);
    const backendMessage = isHtml ? undefined : getBackendErrorMessage(res.data);
    const fallbackMessage = `CMS API Error: ${statusCode} - ${res.statusText ?? "Unknown API Error"}`;
    const message = backendMessage ?? fallbackMessage;
    
    // Don't pass HTML blobs as rawError
    const rawError = isHtml ? undefined : (res.data ?? error);
    
    // Prefer typed error subclasses when possible
    const typedError = createSpecificError(
      statusCode,
      message,
      rawError
    );

    typedError.request = sanitizeRequest(request ?? (error as any)?.request);
    typedError.response = {
      status: statusCode,
      statusText: res.statusText || "",
      data: isHtml ? undefined : res.data,
      headers: res.headers,
    };

    throw typedError;
  }

  // Error where request was made but no response received
  const errorWithRequest = (error as any)?.request ?? request;
  if (errorWithRequest) {
    const req = sanitizeRequest(errorWithRequest);
    const isTimeout =
      (error as any)?.code === "ECONNABORTED" ||
      (typeof (error as any)?.message === "string" &&
        (error as any).message.toLowerCase().includes("timeout"));

    if (isTimeout) {
      throw new CMSAPIError(
        "Timeout Error: CMS API did not respond in time.",
        0,
        "timeout_error",
        error as any,
        req
      );
    }

    throw new CMSAPIError(
      "Network Error: No response received from CMS API. Please check your internet connection.",
      0,
      "network_error",
      error as any,
      req
    );
  }

  // Fallback: unexpected or non-network error
  const errMessage = typeof (error as any)?.message === "string" ? (error as any).message : undefined;
  const message = errMessage ?? "Unexpected client error while calling CMS API.";

  throw new CMSAPIError(
    `Client Error: ${message}`,
    -1,
    "client_error",
    error as any
  );
}
