import type { Configuration } from './configuration';
import { API_CONFIG } from '../constants/constants';

export type RequestOptions = RequestInit & {
    /**
     * Optional request timeout in milliseconds.
     * When provided, the client will abort the request after this duration.
     */
    timeout?: number;
    /**
     * Optional headers bag. This stays loosely typed to be compatible with
     * any existing code that spreads arbitrary objects into headers.
     */
    headers?: Record<string, any>;
};

export const BASE_PATH = API_CONFIG.BASE_URL.replace(/\/+$/, "");

export const COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "\t",
    pipes: "|",
};

export interface RequestArgs {
    url: string;
    options: RequestOptions;
}

export class BaseAPI {
    protected configuration: Configuration | undefined;
    protected basePath: string = BASE_PATH;

    /**
     * Minimal base class that stores configuration and basePath.
     * Concrete API classes are responsible for performing requests using
     * the global `fetch` (or any polyfill provided by the consumer).
     */
    constructor(configuration?: Configuration, basePath: string = BASE_PATH) {
        if (configuration) {
            this.configuration = configuration;
            this.basePath = configuration.basePath ?? basePath;
        } else {
            this.basePath = basePath;
        }
    }
};

export class RequiredError extends Error {
    constructor(public field: string, msg?: string) {
        super(msg);
        this.name = "RequiredError"
    }
}

interface ServerMap {
    [key: string]: {
        url: string,
        description: string,
    }[];
}

export const operationServerMap: ServerMap = {
}
