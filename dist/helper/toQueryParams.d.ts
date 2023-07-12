export declare function toQueryParams<T extends {
    [key: string]: string | number | null | boolean;
}>(object: T): URLSearchParams;
