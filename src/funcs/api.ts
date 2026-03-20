import type { Configuration } from './configuration';
import { DUMMY_BASE_URL, assertParamExists, setBearerAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString } from './common';
import type { RequestArgs, RequestOptions } from './base';
// @ts-ignore
import { BASE_PATH, BaseAPI, RequiredError, operationServerMap } from './base';

export type TrackLeadRequest =
    | {
        /**
         * The `cms_id` from the cookie.
         */
        'clickId': string;
        'eventName': string;
        /**
         * Unique User ID. Used for deduplication (user cannot signup twice).
         */
        'customerExternalId': string;
        /**
         * When set to `"deferred"`, the API may associate `clickId` to `customerId`
         * for later attribution.
         */
        'mode'?: 'deferred';
        /**
         * Optional event timestamp in ISO 8601 format.
         */
        'timestamp'?: string;
        /**
         * Optional customer display name.
         */
        'customerName'?: string;
        /**
         * Optional customer email address.
         */
        'customerEmail'?: string;
        /**
         * Optional URL to a customer avatar image.
         */
        'customerAvatar'?: string;
    }
    | {
        /**
         * In deferred mode, a follow-up call can omit `clickId` and only provide
         * `customerId` (and `eventName`) to attribute using the stored association.
         */
        'clickId'?: never;
        'eventName': string;
        /**
         * Unique User ID. Used for deduplication (user cannot signup twice).
         */
        'mode': 'deferred';
        /**
         * Optional event timestamp in ISO 8601 format.
         */
        'timestamp'?: string;
        /**
         * Optional external customer identifier used in your system.
         */
        'customerExternalId': string;
        /**
         * Optional customer display name.
         */
        'customerName'?: string;
        /**
         * Optional customer email address.
         */
        'customerEmail'?: string;
        /**
         * Optional URL to a customer avatar image.
         */
        'customerAvatar'?: string;
    };
export interface TrackResponse {
    'status'?: string;
}
export interface TrackSaleRequest {
    /**
     * The `dub_id` from the cookie.
     */
    'clickId': string;
    'eventName': string;
    /**
     * Optional event timestamp in ISO 8601 format.
     */
    'timestamp'?: string;
    /**
     * Optional external customer identifier used in your system.
     */
    'customerExternalId': string;
    /**
     * Optional customer display name.
     */
    'customerName'?: string;
    /**
     * Optional customer email address.
     */
    'customerEmail'?: string;
    /**
     * Optional URL to a customer avatar image.
     */
    'customerAvatar'?: string;
    /**
     * Unique Transaction ID. Used for deduplication (charge cannot happen twice).
     */
    'invoiceId': string;
    /**
     * The value of the sale in cents.
     */
    'amount': number;
    /**
     * Three-letter currency code.
     */
    'currency': string;
}

/**
 * EventsApi - axios parameter creator
 */
export const EventsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Track a Lead
         * @param {TrackLeadRequest} trackLeadRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        trackLead: async (trackLeadRequest: TrackLeadRequest, options: RequestOptions = {}): Promise<RequestArgs> => {
            // verify required parameter 'trackLeadRequest' is not null or undefined
            assertParamExists('trackLead', 'trackLeadRequest', trackLeadRequest)
            const localVarPath = `/track/lead`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication bearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)

            localVarHeaderParameter['Content-Type'] = 'application/json';
            localVarHeaderParameter['Accept'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(trackLeadRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Track a Sale
         * @param {TrackSaleRequest} trackSaleRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        trackSale: async (trackSaleRequest: TrackSaleRequest, options: RequestOptions = {}): Promise<RequestArgs> => {
            // verify required parameter 'trackSaleRequest' is not null or undefined
            assertParamExists('trackSale', 'trackSaleRequest', trackSaleRequest)
            const localVarPath = `/track/sale`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication bearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)

            localVarHeaderParameter['Content-Type'] = 'application/json';
            localVarHeaderParameter['Accept'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(trackSaleRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * EventsApi - functional programming interface
 */
export const EventsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = EventsApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Track a Lead
         * @param {TrackLeadRequest} trackLeadRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async trackLead(trackLeadRequest: TrackLeadRequest, options?: RequestOptions, basePathOverride?: string): Promise<TrackResponse> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.trackLead(trackLeadRequest, options ?? {});
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['EventsApi.trackLead']?.[localVarOperationServerIndex]?.url;
            const basePath = basePathOverride ?? localVarOperationServerBasePath ?? configuration?.basePath ?? BASE_PATH;
            return performFetchRequest<TrackResponse>(localVarAxiosArgs, basePath);
        },
        /**
         * 
         * @summary Track a Sale
         * @param {TrackSaleRequest} trackSaleRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async trackSale(trackSaleRequest: TrackSaleRequest, options?: RequestOptions, basePathOverride?: string): Promise<TrackResponse> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.trackSale(trackSaleRequest, options ?? {});
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['EventsApi.trackSale']?.[localVarOperationServerIndex]?.url;
            const basePath = basePathOverride ?? localVarOperationServerBasePath ?? configuration?.basePath ?? BASE_PATH;
            return performFetchRequest<TrackResponse>(localVarAxiosArgs, basePath);
        },
    }
};

/**
 * EventsApi - factory interface
 */
export const EventsApiFactory = function (configuration?: Configuration, basePath?: string) {
    const localVarFp = EventsApiFp(configuration)
    return {
        /**
         * 
         * @summary Track a Lead
         * @param {TrackLeadRequest} trackLeadRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        trackLead(trackLeadRequest: TrackLeadRequest, options?: RequestOptions): Promise<TrackResponse> {
            return localVarFp.trackLead(trackLeadRequest, options, basePath);
        },
        /**
         * 
         * @summary Track a Sale
         * @param {TrackSaleRequest} trackSaleRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        trackSale(trackSaleRequest: TrackSaleRequest, options?: RequestOptions): Promise<TrackResponse> {
            return localVarFp.trackSale(trackSaleRequest, options, basePath);
        },
    };
};

/**
 * EventsApi - object-oriented interface
 */
export class EventsApi extends BaseAPI {
    /**
     * 
     * @summary Track a Lead
     * @param {TrackLeadRequest} trackLeadRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    public trackLead(trackLeadRequest: TrackLeadRequest, options?: RequestOptions) {
        return EventsApiFp(this.configuration).trackLead(trackLeadRequest, options, this.basePath);
    }

    /**
     * 
     * @summary Track a Sale
     * @param {TrackSaleRequest} trackSaleRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    public trackSale(trackSaleRequest: TrackSaleRequest, options?: RequestOptions) {
        return EventsApiFp(this.configuration).trackSale(trackSaleRequest, options, this.basePath);
    }
}


/**
 * Internal helper that performs a fetch request based on the generated
 * `RequestArgs` and normalizes errors into an Axios-like shape so the
 * existing error handling and retry logic in the SDK can continue to
 * operate without changes.
 */
async function performFetchRequest<T>(requestArgs: RequestArgs, basePath: string): Promise<T> {
    const url = (basePath ?? BASE_PATH).replace(/\/+$/, "") + requestArgs.url;
    const { timeout, data, ...restOptions } = requestArgs.options as any;

    if (typeof fetch !== "function") {
        throw new Error("Global fetch API is not available. Please provide a fetch polyfill in this environment.");
    }

    const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
    const signal = controller?.signal;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (controller && typeof timeout === "number" && timeout > 0) {
        timeoutId = setTimeout(() => controller.abort(), timeout);
    }

    try {
        const fetchOptions: any = { ...restOptions, signal };

        // The generated client stores the request payload on `data` (Axios-style),
        // but the fetch API expects it on `body`. Translate between the two.
        if (typeof data !== "undefined") {
            const rawHeaders = fetchOptions.headers;
            let headers: Record<string, string> = {};

            if (rawHeaders instanceof Headers) {
                rawHeaders.forEach((value, key) => {
                    headers[key] = value;
                });
            } else if (Array.isArray(rawHeaders)) {
                headers = Object.fromEntries(rawHeaders.map(([key, value]) => [String(key), String(value)]));
            } else if (rawHeaders && typeof rawHeaders === "object") {
                headers = Object.fromEntries(
                    Object.entries(rawHeaders).map(([key, value]) => [key, String(value)]),
                );
            }

            const requestContentTypeHeader = Object.keys(headers).find(
                (h) => h.toLowerCase() === "content-type",
            );
            const requestContentType = requestContentTypeHeader
                ? headers[requestContentTypeHeader]
                : undefined;

            // If Content-Type is JSON (our default), ensure the body is a JSON string.
            if (requestContentType?.toLowerCase().includes("application/json")) {
                fetchOptions.body =
                    typeof data === "string" ? data : JSON.stringify(data);
            } else {
                fetchOptions.body = data;
            }
        }

        const response = await fetch(url, fetchOptions);

        const responseContentType = response.headers.get("content-type") || "";
        const isJson = responseContentType.toLowerCase().includes("application/json");
        let dataResult: unknown = null;

        if (response.status !== 204 && response.status !== 205) {
            const responseText = await response.text();

            if (isJson && responseText) {
                try {
                    dataResult = JSON.parse(responseText);
                } catch {
                    dataResult = responseText;
                }
            } else {
                dataResult = responseText;
            }
        }

        if (!response.ok) {
            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            const error: any = new Error(`Request failed with status code ${response.status}`);
            error.response = {
                status: response.status,
                statusText: response.statusText,
                data: dataResult,
                headers: responseHeaders,
            };
            throw error;
        }

        return dataResult as T;
    } catch (err: any) {
        // Normalize fetch/AbortError/network errors into an Axios-style shape
        if (err?.name === "AbortError") {
            err.code = "ECONNABORTED";
        }

        if (!err.response) {
            // Attach only minimal request info to avoid leaking sensitive data
            err.request = { url };
        }

        throw err;
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
}
