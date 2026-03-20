/**
 * Base error class for CMS API errors.
 * Separated into its own file to avoid circular dependencies.
 */
export class CMSAPIError extends Error {
  public readonly statusCode: number;
  public readonly type: string;
  public readonly rawError: any;
  public readonly cause?: unknown;
  public request?: {
    url?: string;
    method?: string;
    headers?: Record<string, any>;
    timeout?: number;
  };
  public response?: {
    status: number;
    statusText: string;
    data?: any;
    headers?: Record<string, any>;
  };

  constructor(
    message: string,
    statusCode: number,
    type: string,
    rawError: any,
    request?: CMSAPIError["request"],
    response?: CMSAPIError["response"]
  ) {
    super(message);
    this.name = "CMSAPIError";
    this.statusCode = statusCode;
    this.type = type;
    this.rawError = rawError;
    this.cause =
      rawError instanceof Error || typeof rawError === "string"
        ? rawError
        : undefined;
    this.request = request;
    this.response = response;

    // Ensure proper prototype chain in transpiled output
    Object.setPrototypeOf(this, new.target.prototype);
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, new.target);
    }

    // Make heavy properties non-enumerable so console.log / inspection
    // stays focused on the high-level error information.
    try {
      Object.defineProperties(this, {
        rawError: { enumerable: false },
        cause: { enumerable: false },
        request: { enumerable: false },
        response: { enumerable: false },
      });
    } catch {
      // If defineProperties fails for any reason, we still keep the data;
      // it will just remain enumerable.
    }
  }

  toJSON(): { statusCode: number; message: string } {
    return {
      statusCode: this.statusCode,
      message: this.message,
    };
  }
}
