# cms-ts

[![npm version](https://img.shields.io/npm/v/cms-ts)](https://www.npmjs.com/package/cms-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)

Official TypeScript/JavaScript SDK for the CutMeShort CMS API. Track leads and sales with reliable retry logic, comprehensive validation, and security best practices.

**Key Features:**
- 🚀 Full TypeScript support with strict types
- ✅ Input validation with Zod
- 🔄 Automatic retry with exponential backoff
- 🛡️ Security hardened (API key validation, sensitive data redaction)
- ⚡ Sub-second tracking events
- 📊 Comprehensive error handling with specific error types

---

## Install

```bash
npm install cms-ts
```

## Requirements

- Node.js 18+ (recommended) or any runtime with global `fetch`
- TypeScript 5+ (optional, for type safety)

If your runtime does not provide `fetch`, add a polyfill before creating the client.

```ts
import fetch, { Headers, Request, Response } from "cross-fetch";

(globalThis as any).fetch = fetch;
(globalThis as any).Headers = Headers;
(globalThis as any).Request = Request;
(globalThis as any).Response = Response;
```

## Quick Start

```ts
import { CMS } from "cms-ts";

const cms = new CMS({
  apiKey: process.env.CMS_API_KEY!,
  timeout: 10_000,
});

const response = await cms.trackLead({
  clickId: "id_123",
  eventName: "signup_started",
  customerExternalId: "user_42",
});

console.log(response);
```

## API Methods

### `cms.trackLead(leadData, options?)`

```ts
import { CMS } from "cms-ts";

const cms = new CMS({ apiKey: "sk_live_xxx" });

await cms.trackLead({
  clickId: "id_123",
  eventName: "signup_started",
  customerExternalId: "user_42",
});
```

Lead payload fields:
- `clickId: string` (optional in **deferred** follow-up calls)
- `eventName: string`
- `customerExternalId: string`
- `timestamp?: string` (ISO 8601, e.g. `new Date().toISOString()`)
- `customerName?: string`
- `customerEmail?: string`
- `customerAvatar?: string`

#### Deferred mode (two-step lead attribution)

If you can’t reliably send the `clickId` at the moment you want to record a lead event, you can use **deferred mode**:

```ts
import { CMS } from "cms-ts";

const cms = new CMS({ apiKey: "xxx" });

// Step 1: store the clickId <-> customerExternalId association
await cms.trackLead({
  clickId: "id_123",
  eventName: "signup_started",
  customerExternalId: "user_42",
  mode: "deferred",
});

// Step 2: later, track using just customerExternalId (no clickId)
await cms.trackLead({
  eventName: "email_verified",
  customerExternalId: "user_42",
  mode: "deferred",
});
```

### `cms.trackSale(saleData, options?)`

```ts
import { CMS } from "cms-ts";

const cms = new CMS({ apiKey: "xxx" });

await cms.trackSale({
  clickId: "id_123",
  customerExternalId: "user_123",
  eventName: "purchase_completed",
  invoiceId: "inv_987",
  amount: 4999,
  currency: "USD",
});
```

Sale payload fields:
- `clickId: string`
- `eventName: string`
- `timestamp?: string` (ISO 8601, e.g. `new Date().toISOString()`)
- `customerExternalId: string`
- `customerName?: string`
- `customerEmail?: string`
- `customerAvatar?: string`
- `invoiceId: string`
- `amount: number` (in cents)
- `currency: string` (3-letter code, e.g. `USD`)

## Configuration

`new CMS(config)` accepts:

```ts
type CMSConfig = {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  retryMaxDelayMs?: number;
  retryOnStatuses?: number[];
  retryOnNetworkError?: boolean;
};
```

Defaults:
- `baseUrl`: `https://www.cutmeshort.com`
- `timeout`: `10000`
- `maxRetries`: `2`
- `retryDelayMs`: `500`
- `retryMaxDelayMs`: `10000`
- `retryOnStatuses`: `[429, 500, 502, 503, 504]`
- `retryOnNetworkError`: `true`

## Per-request Overrides

You can override retry/timeout settings for a specific call:

```ts
import { CMS } from "cms-ts";

const cms = new CMS({ apiKey: "sk_live_xxx" });

await cms.trackLead(
  {
    clickId: "id_123",
    eventName: "signup_started",
    customerExternalId: "user_42",
  },
  {
    timeout: 5000,
    maxRetries: 1,
    retryDelayMs: 300,
  }
);
```

## Error Handling

The SDK provides specific error classes for different failure scenarios. Catch and handle them appropriately:

```ts
import { 
  CMS, 
  CMSAPIError
} from "cms-ts";

const cms = new CMS({ apiKey: process.env.CMS_API_KEY });

try {
  await cms.trackLead({
    clickId: "id_123",
    eventName: "signup_started",
    customerExternalId: "user_42",
  });
} ccatch (error) {
  if (error instanceof CMSAPIError) {
    console.error("CMS API error", {
      statusCode: error.statusCode,
      type: error.type,
      message: error.message, 
    });
  } else {
    console.error("Unexpected error", error);
  }
}
```

### Available Error Types

| Error Type | HTTP Code | When It Happens |
|---|---|---|
| `BadRequestError` | 400 | Invalid payload format |
| `UnauthorizedError` | 401 | Invalid/missing API key |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource already exists |
| `UnprocessableEntityError` | 422 | Validation failed |
| `RateLimitError` | 429 | Too many requests |
| `InternalServerError` | 500 | Server error |
| `BadGatewayError` | 502 | Gateway error (retried) |
| `ServiceUnavailableError` | 503 | Service down (retried) |
| `GatewayTimeoutError` | 504 | Timeout (retried) |

**Note:** Errors with HTTP codes 429, 500, 502, 503, 504 are automatically retried (configurable).

### Retry Behavior

The SDK automatically retries transient failures with exponential backoff:

```ts
const cms = new CMS({
  apiKey: process.env.CMS_API_KEY,
  maxRetries: 2,           // default: 2
  retryDelayMs: 500,       // initial delay: 500ms
  retryMaxDelayMs: 10000,  // max delay cap: 10s
  retryOnNetworkError: true,
});

// Override for a specific request
await cms.trackLead(
  { clickId: "id_123", eventName: "event", customerExternalId: "user_1" },
  { maxRetries: 5, retryDelayMs: 1000 }
);
```
## TypeScript Usage

The SDK is fully typed. Utilize TypeScript for better DX:

```ts
import { 
  CMS, 
  type CMSConfig,
  type LeadPayload,
  type SalePayload,
  type RequestOptions 
} from "cms-ts";

// Config is validated at initialization
const config: CMSConfig = {
  apiKey: process.env.CMS_API_KEY!,
  timeout: 5000,
  maxRetries: 3,
};

const cms = new CMS(config);

// Payloads have full type hints
const leadPayload: LeadPayload = {
  clickId: "id_123",
  eventName: "signup_started",
  customerExteranlId: "user_42",
  customerEmail: "user@example.com",
};

// RequestOptions for per-call configuration
const options: RequestOptions = {
  timeout: 3000,
  maxRetries: 1,
};

await cms.trackLead(leadPayload, options);
```

## Public API

This package intentionally exposes only:
- `CMS` (use `cms.trackLead` and `cms.trackSale`)
- `CMSAPIError` (for `instanceof` checks)
