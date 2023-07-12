import { type Ref } from 'vue';
export interface CountDownReturn {
    hours: Ref<number>;
    seconds: Ref<number>;
    minutes: Ref<number>;
    /**
     * 倒计时时间 <= 0 时触发
     */
    onFinished: (cb: () => void) => void;
    /**
     * 调用后拉取时间后开始计时, 每个实例只能调用一次
     */
    setDuration: () => void;
    /**
     * 重置倒计时状态到初始状态.
     */
    reset: () => void;
    /**
     * 调用后销毁倒计时
     */
    destroy: () => void;
}
/**
 * 基于服务器同步的倒计时
 * @param syncDuration 调用后返回剩余计时时间 用于与服务端同步时间使用
 * @param interval 定期与服务端同步时间的间隔
 * @returns
 */
export declare function useCountdown(syncDuration: () => Promise<number | null>, interval?: number): CountDownReturn;
