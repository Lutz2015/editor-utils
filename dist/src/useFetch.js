import { containsProp, createEventHook, until, useTimeoutFn } from '@vueuse/core';
import { computed, isRef, ref, shallowRef, unref, watch } from 'vue';
const defaultWindow = window;
const payloadMapping = {
    json: 'application/json',
    text: 'text/plain',
    formData: 'multipart/form-data',
};
/**
 * !!!IMPORTANT!!!
 *
 * If you update the UseFetchOptions interface, be sure to update this object
 * to include the new options
 */
function isFetchOptions(obj) {
    return containsProp(obj, 'immediate', 'refetch', 'initialData', 'timeout', 'beforeFetch', 'afterFetch', 'onFetchError');
}
function headersToObject(headers) {
    if (headers instanceof Headers)
        return Object.fromEntries([...headers.entries()]);
    return headers;
}
export function createFetch(config = {}) {
    const _options = config.options || {};
    const _fetchOptions = config.fetchOptions || {};
    function useFactoryFetch(url, ...args) {
        const computedUrl = computed(() => config.baseUrl ? joinPaths(unref(config.baseUrl), unref(url)) : unref(url));
        let options = _options;
        let fetchOptions = _fetchOptions;
        // Merge properties into a single object
        if (args.length > 0) {
            if (isFetchOptions(args[0])) {
                options = { ...options, ...args[0] };
            }
            else {
                fetchOptions = {
                    ...fetchOptions,
                    ...args[0],
                    headers: {
                        ...(headersToObject(fetchOptions.headers) || {}),
                        ...(headersToObject(args[0].headers) || {}),
                    },
                };
            }
        }
        if (args.length > 1 && isFetchOptions(args[1]))
            options = { ...options, ...args[1] };
        return useFetch(computedUrl, fetchOptions, options);
    }
    return useFactoryFetch;
}
export function useFetch(url, ...args) {
    const supportsAbort = typeof AbortController === 'function';
    let fetchOptions = {};
    let options = {
        immediate: true,
        refetch: false,
        timeout: 0,
        ignore400Error: false,
    };
    const config = {
        method: 'GET',
        type: 'text',
        payload: undefined,
    };
    if (args.length > 0) {
        if (isFetchOptions(args[0]))
            options = { ...options, ...args[0] };
        else
            fetchOptions = args[0];
    }
    if (args.length > 1) {
        if (isFetchOptions(args[1]))
            options = { ...options, ...args[1] };
    }
    const { fetch = defaultWindow?.fetch, initialData, timeout } = options;
    // Event Hooks
    const responseEvent = createEventHook();
    const errorEvent = createEventHook();
    const finallyEvent = createEventHook();
    const isFinished = ref(false);
    const isFetching = ref(false);
    const aborted = ref(false);
    const statusCode = ref(null);
    const response = shallowRef(null);
    const error = shallowRef(null);
    const data = shallowRef(initialData);
    const canAbort = computed(() => supportsAbort && isFetching.value);
    let controller;
    let timer;
    const abort = () => {
        if (supportsAbort && controller)
            controller.abort();
    };
    const loading = (isLoading) => {
        isFetching.value = isLoading;
        isFinished.value = !isLoading;
    };
    if (timeout)
        timer = useTimeoutFn(abort, timeout, { immediate: false });
    const execute = async (throwOnFailed = false) => {
        loading(true);
        error.value = null;
        statusCode.value = null;
        aborted.value = false;
        controller = undefined;
        if (supportsAbort) {
            controller = new AbortController();
            controller.signal.onabort = () => (aborted.value = true);
            fetchOptions = {
                ...fetchOptions,
                signal: controller.signal,
            };
        }
        const defaultFetchOptions = {
            method: config.method,
            headers: {},
        };
        if (config.payload) {
            const headers = headersToObject(defaultFetchOptions.headers);
            if (config.payloadType)
                headers['Content-Type'] = payloadMapping[config.payloadType] ?? config.payloadType;
            defaultFetchOptions.body =
                config.payloadType === 'json'
                    ? JSON.stringify(unref(config.payload))
                    : unref(config.payload);
        }
        let isCanceled = false;
        const context = {
            url: unref(url),
            options: fetchOptions,
            cancel: () => {
                isCanceled = true;
            },
        };
        if (options.beforeFetch)
            Object.assign(context, await options.beforeFetch(context));
        if (isCanceled || !fetch) {
            loading(false);
            return Promise.resolve(null);
        }
        let responseData = null;
        if (timer)
            timer.start();
        return new Promise((resolve, reject) => {
            fetch(context.url, {
                ...defaultFetchOptions,
                ...context.options,
                headers: {
                    ...headersToObject(defaultFetchOptions.headers),
                    ...headersToObject(context.options?.headers),
                },
            })
                .then(async (fetchResponse) => {
                response.value = fetchResponse;
                statusCode.value = fetchResponse.status;
                responseData = await fetchResponse[config.type]();
                if (statusCode.value >= 400 && !options.ignore400Error) {
                    throw new Error(fetchResponse.statusText);
                }
                if (options.afterFetch && statusCode.value >= 200 && statusCode.value < 300)
                    ({ data: responseData } = await options.afterFetch({
                        data: responseData,
                        response: fetchResponse,
                    }));
                data.value = responseData;
                // see: https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
                if (!fetchResponse.ok)
                    throw new Error(fetchResponse.statusText);
                responseEvent.trigger(fetchResponse);
                return resolve(fetchResponse);
            })
                .catch(async (fetchError) => {
                let errorData = fetchError.message || fetchError.name;
                if (options.onFetchError)
                    ({ data: responseData, error: errorData } = await options.onFetchError({
                        response: response.value,
                        data: responseData,
                        error: fetchError,
                    }));
                data.value = responseData;
                error.value = errorData;
                errorEvent.trigger(fetchError);
                if (throwOnFailed)
                    return reject(fetchError);
                return resolve(null);
            })
                .finally(() => {
                loading(false);
                if (timer)
                    timer.stop();
                finallyEvent.trigger(null);
            });
        });
    };
    watch(() => [unref(url), unref(options.refetch)], () => unref(options.refetch) && execute(), { deep: true });
    const shell = {
        isFinished,
        statusCode,
        response,
        error,
        data,
        isFetching,
        canAbort,
        aborted,
        abort,
        execute,
        onFetchResponse: responseEvent.on,
        onFetchError: errorEvent.on,
        onFetchFinally: finallyEvent.on,
        // method
        get: setMethod('GET'),
        put: setMethod('PUT'),
        post: setMethod('POST'),
        delete: setMethod('DELETE'),
        patch: setMethod('PATCH'),
        head: setMethod('HEAD'),
        options: setMethod('OPTIONS'),
        // type
        json: setType('json'),
        text: setType('text'),
        blob: setType('blob'),
        arrayBuffer: setType('arrayBuffer'),
        formData: setType('formData'),
    };
    const promiseLikeShell = {
        ...shell,
        then(onFulfilled, onRejected) {
            return until(isFinished)
                .toBe(true)
                .then(() => onFulfilled(shell))
                .catch((error) => onRejected(error));
        },
    };
    function setMethod(method) {
        return (payload, payloadType) => {
            if (!isFetching.value) {
                config.method = method;
                config.payload = payload;
                config.payloadType = payloadType;
                // watch for payload changes
                if (isRef(config.payload)) {
                    watch(() => [unref(config.payload), unref(options.refetch)], () => unref(options.refetch) && execute(), { deep: true });
                }
                // Set the payload to json type only if it's not provided and a literal object is provided
                // The only case we can deduce the content type and `fetch` can't
                if (!payloadType &&
                    unref(payload) &&
                    (Object.getPrototypeOf(unref(payload)) === Object.prototype || Array.isArray(payload)))
                    config.payloadType = 'json';
                return promiseLikeShell;
            }
            return undefined;
        };
    }
    function setType(type) {
        return () => {
            if (!isFetching.value) {
                config.type = type;
                return promiseLikeShell;
            }
            return undefined;
        };
    }
    if (options.immediate)
        setTimeout(execute, 0);
    return promiseLikeShell;
}
function joinPaths(start, end) {
    if (!start.endsWith('/') && !end.startsWith('/'))
        return `${start}/${end}`;
    return `${start}${end}`;
}
