declare const isLogin: () => boolean;
declare const getToken: () => string | null;
declare const setToken: (token: string) => void;
declare const clearToken: () => void;
export { isLogin, getToken, setToken, clearToken };
