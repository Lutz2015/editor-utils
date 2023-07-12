/**
 * 轮询给定的任务, 直到任务 resolve 任何非 undefined 值, 或者 throw Error
 * @param body 异步任务
 * @param interval 轮询间隔
 */
export function loopService(body, interval = 1000) {
    let running = false;
    let timer;
    function loop(resolve, reject) {
        timer = setTimeout(async () => {
            if (!running) {
                return resolve(undefined);
            }
            try {
                const result = await body();
                if (result !== undefined) {
                    running = false;
                    return resolve(result);
                }
            }
            catch (error) {
                running = false;
                reject(error);
            }
            loop(resolve, reject);
        }, interval);
    }
    return {
        /**
         * 开始执行给定的任务, 轮询结束后 resolve 返回的 Promise
         *
         * 如果当前处于执行中, 则会抛出错误.
         */
        start() {
            if (running) {
                throw new Error('Already running!');
            }
            running = true;
            return new Promise((resolve, reject) => loop(resolve, reject));
        },
        /**
         * 停止当前任务的执行
         */
        stop() {
            clearTimeout(timer);
            running = false;
        },
        /**
         * 销毁此实例内部的引用
         */
        destroy() {
            running = false;
            clearTimeout(timer);
            body = null;
        },
    };
}
