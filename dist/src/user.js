const TOKEN_KEY = 'USER_INFO';
export function getUserInfo() {
    const data = localStorage.getItem(TOKEN_KEY);
    if (data !== null) {
        return JSON.parse(data);
    }
    return data;
}
export function setUserInfo(userInfo) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(userInfo));
}
export function clearUserInfo() {
    localStorage.removeItem(TOKEN_KEY);
}
