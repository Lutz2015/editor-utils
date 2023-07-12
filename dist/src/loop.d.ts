/**
 * 轮询给定的任务, 直到任务 resolve 任何非 undefined 值, 或者 throw Error
 * @param body 异步任务
 * @param interval 轮询间隔
 */
export declare function loopService<T>(body: () => Promise<T | undefined>, interval?: number): {
    /**
     * 开始执行给定的任务, 轮询结束后 resolve 返回的 Promise
     *
     * 如果当前处于执行中, 则会抛出错误.
     */
    start(): Promise<T | undefined>;
    /**
     * 停止当前任务的执行
     */
    stop(): void;
    /**
     * 销毁此实例内部的引用
     */
    destroy(): void;
};
