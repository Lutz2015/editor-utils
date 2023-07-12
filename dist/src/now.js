/**
 * 获取当前时间戳, 优先使用 window.performance.now
 */
export const now = window.performance.now ? () => window.performance.now() : () => Date.now();
