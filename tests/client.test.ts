import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CMS, type CMSConfig } from "../src/client";

function createSdk(overrides: Partial<CMSConfig> = {}) {
  return new CMS({
    apiKey: "sk_test_1234567890abcdefghij",
    ...overrides,
  });
}

describe("CMS", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = (globalThis as any).fetch;
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ status: "ok" }),
      text: async () => '{"status":"ok"}',
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).fetch = originalFetch;
  });

  it("creates an instance with minimal valid config", () => {
    const sdk = createSdk();
    expect(sdk).toBeInstanceOf(CMS);
    // Ensure the underlying EventsApi is created
    expect(sdk.events).toBeDefined();
  });

  it("calls trackLead successfully", async () => {
    const sdk = createSdk();

    const res = await sdk.trackLead({
      clickId: "dub_123",
      eventName: "signup_started",
      customerExternalId: "user_42",
    });

    expect(res).toEqual({ status: "ok" });
    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
  });

  it("supports deferred lead follow-up without clickId", async () => {
    const sdk = createSdk();

    const res = await sdk.trackLead({
      eventName: "email_verified",
      customerExternalId: "user_42",
      mode: "deferred",
    });

    expect(res).toEqual({ status: "ok" });
    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
  });

  it("calls trackSale successfully", async () => {
    const sdk = createSdk();

    const res = await sdk.trackSale({
      clickId: "dub_123",
      customerExternalId: "user_42",
      eventName: "purchase_completed",
      invoiceId: "inv_987",
      amount: 49.99,
      currency: "USD",
    });

    expect(res).toEqual({ status: "ok" });
    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
  });

  it("supports sale tracking without clickId", async () => {
    const sdk = createSdk();

    const res = await sdk.trackSale({
      customerExternalId: "user_42",
      eventName: "purchase_completed",
      invoiceId: "inv_988",
      amount: 49.99,
      currency: "USD",
    });

    expect(res).toEqual({ status: "ok" });
    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
  });

  it("normalizes DOMException AbortError without mutating read-only code", async () => {
    const sdk = createSdk({ maxRetries: 0 });

    const abortError = new DOMException("The operation was aborted", "AbortError");
    (globalThis as any).fetch = vi.fn().mockRejectedValue(abortError);

    await expect(
      sdk.trackLead({
        clickId: "dub_123",
        eventName: "signup_started",
        customerExternalId: "user_42",
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining("Timeout Error"),
      type: "timeout_error",
    });

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
  });
});

