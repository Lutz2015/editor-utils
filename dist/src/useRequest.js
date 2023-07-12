/// <reference types="vite/client" />
import { createFetch, } from './useFetch';
import { ElNotification } from 'element-plus';
function popUpNotification(title, message) {
    ElNotification({
        title,
        message,
        type: 'error',
    });
}
function createFetchError(errorHandler) {
    return function onFetchError({ data, error, response }) {
        if (!response) {
            popUpNotification('未知错误', `${data} : ${error}`);
            if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.error(`${data} : ${error}`);
            }
            return { data, error, response };
        }
        errorHandler?.(response.status);
        if (response.status === 401) {
            return;
        }
        if (typeof data === 'string') {
            try {
                // the caller may not set response type
                // assume JSON by default
                data = JSON.parse(data);
            }
            catch (_) {
                //
            }
        }
        if (data !== null && typeof data === 'object') {
            popUpNotification('错误', data.message);
        }
        else {
            popUpNotification('未知错误', `${data} : ${error}`);
            if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.error(`${data} : ${error}`);
            }
        }
        return { data, error, response };
    };
}
/**
 * Only popup notification when got error
 */
export function createNoAuthFetch({ options, ...rest }) {
    return createFetch({
        ...rest,
        options: {
            onFetchError: createFetchError(),
            ...options,
        },
    });
}
export function createAuthFetch({ authToken, errorHandler, options, baseUrl, fetchOptions, }) {
    return createFetch({
        baseUrl,
        fetchOptions,
        options: {
            beforeFetch({ cancel, options }) {
                const token = authToken();
                if (token === undefined) {
                    return cancel();
                }
                Object.assign((options.headers = options.headers ?? {}), {
                    Authorization: token,
                });
                return { options };
            },
            onFetchError: createFetchError(errorHandler),
            ...options,
        },
    });
}
export function createOptionalAuthFetch({ authToken, errorHandler, options, baseUrl, fetchOptions, }) {
    return createFetch({
        baseUrl,
        fetchOptions,
        options: {
            beforeFetch({ options }) {
                Object.assign((options.headers = options.headers ?? {}), {
                    Authorization: authToken(),
                });
                return { options };
            },
            onFetchError: createFetchError(errorHandler),
            ...options,
        },
    });
}
