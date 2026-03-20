import { describe, expect, it } from "vitest";
import { BadRequestError, handleApiError } from "../src/errors";

describe("handleApiError", () => {
  it("uses backend error message when available", () => {
    const backendError = {
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {
          message: "Invalid clickId provided",
        },
      },
    };

    try {
      handleApiError(backendError);
      expect.fail("Expected handleApiError to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Error).message).toBe("Invalid clickId provided");
    }
  });

  it("falls back to default SDK error message when backend message is missing", () => {
    const backendError = {
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {},
      },
    };

    try {
      handleApiError(backendError);
      expect.fail("Expected handleApiError to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Error).message).toBe("CMS API Error: 400 - Bad Request");
    }
  });

  it("uses nested backend error.message when available", () => {
    const backendError = {
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {
          error: {
            message: "Nested validation message",
          },
        },
      },
    };

    try {
      handleApiError(backendError);
      expect.fail("Expected handleApiError to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Error).message).toBe("Nested validation message");
    }
  });

  it("uses backend errors array object message when available", () => {
    const backendError = {
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {
          errors: [{ message: "First array validation message" }],
        },
      },
    };

    try {
      handleApiError(backendError);
      expect.fail("Expected handleApiError to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Error).message).toBe("First array validation message");
    }
  });

  it("uses backend errors array object code when available", () => {
    const backendError = {
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {
          errors: [{ code: "customerExternalId is required", errorMessage: "An error occured." }],
        },
      },
    };

    try {
      handleApiError(backendError);
      expect.fail("Expected handleApiError to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Error).message).toBe("customerExternalId is required");
      expect((error as any).statusCode).toBe(400);
      expect((error as any).cause).toBeUndefined();
      expect(JSON.parse(JSON.stringify(error))).toEqual({
        statusCode: 400,
        message: "customerExternalId is required",
      });
    }
  });

  it("handles HTML error pages cleanly without dumping HTML", () => {
    const htmlError = {
      response: {
        status: 404,
        statusText: "Not Found",
        data: "<!doctype html><html><body>Page not found</body></html>",
      },
    };

    try {
      handleApiError(htmlError);
      expect.fail("Expected handleApiError to throw");
    } catch (error) {
      expect((error as Error).message).toBe("CMS API Error: 404 - Not Found");
      expect((error as any).statusCode).toBe(404);
      expect((error as any).cause).toBeUndefined();
      expect((error as any).response?.data).toBeUndefined();
      expect(JSON.parse(JSON.stringify(error))).toEqual({
        statusCode: 404,
        message: "CMS API Error: 404 - Not Found",
      });
    }
  });
});
