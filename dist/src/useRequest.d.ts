import { type CreateFetchOptions, type UseFetchOptions } from './useFetch';
export declare type AuthFetchOptions = Omit<CreateFetchOptions, 'options'> & {
    /**
     * Will Run immediately before the fetch request is dispatched
     * Return token when got token otherwise cancel this request
     */
    authToken: () => string | undefined;
    /**
     * Will Run afeter response code >= 400
     */
    errorHandler?: (statusCode: number) => void;
    options?: Omit<UseFetchOptions, 'beforeFetch' | 'onFetchError' | 'ignore400Error'>;
};
export declare type NoAuthFetchOptions = Omit<CreateFetchOptions, 'options'> & {
    options?: Omit<UseFetchOptions, 'onFetchError' | 'ignore400Error'>;
};
/**
 * Only popup notification when got error
 */
export declare function createNoAuthFetch({ options, ...rest }: NoAuthFetchOptions): typeof import("./useFetch").useFetch;
export declare function createAuthFetch({ authToken, errorHandler, options, baseUrl, fetchOptions, }: AuthFetchOptions): typeof import("./useFetch").useFetch;
export declare function createOptionalAuthFetch({ authToken, errorHandler, options, baseUrl, fetchOptions, }: AuthFetchOptions): typeof import("./useFetch").useFetch;
