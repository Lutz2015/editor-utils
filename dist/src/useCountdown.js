import { ref } from 'vue';
import parseMilliseconds from 'parse-ms';
import { now } from './now';
/**
 * 基于服务器同步的倒计时
 * @param syncDuration 调用后返回剩余计时时间 用于与服务端同步时间使用
 * @param interval 定期与服务端同步时间的间隔
 * @returns
 */
export function useCountdown(syncDuration, interval = 100 * 600) {
    let countdown = 0;
    let start = false;
    let isFinishedCallback;
    const hours = ref(0);
    const seconds = ref(0);
    const minutes = ref(0);
    let countdownTimer;
    let doubleChecking = false;
    /**
     * 当客户端判断时间 =0 时, 向服务器再次确认时间
     * @returns
     */
    async function doubleCheck() {
        if (doubleChecking) {
            return;
        }
        doubleChecking = true;
        const duration = await syncDuration();
        doubleChecking = false;
        if (duration) {
            if (duration <= 0) {
                isFinishedCallback?.();
                destroy();
                return;
            }
            else {
                countdown = duration;
            }
        }
        start = true;
    }
    function loop() {
        let timeStamp = now();
        countdownTimer = setInterval(() => {
            if (start) {
                countdown -= Math.floor(now() - timeStamp);
                if (countdown <= 0) {
                    // 停止所有轮询逻辑
                    start = false;
                    // 再此向服务器确认时间
                    doubleCheck();
                    // 让客户端显示剩余时间 0
                    countdown = 0;
                }
                const parsed = parseMilliseconds(countdown);
                timeStamp = now();
                hours.value = parsed.hours;
                minutes.value = parsed.minutes;
                seconds.value = parsed.seconds;
            }
        }, 1000);
    }
    let syncTimer;
    function syncWithServerService() {
        syncTimer = setInterval(async () => {
            if (start) {
                // using server duration first
                // local one as fallback
                countdown = (await syncDuration()) ?? countdown;
            }
        }, interval);
    }
    function destroy() {
        start = false;
        clearInterval(syncTimer);
        clearInterval(countdownTimer);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        isFinishedCallback = null;
    }
    function reset() {
        // TODO: 这里可能会出现一个机率极低的 bug
        // 当处于再次确认期间, 这里 start = false 会被随后的检查改为 true
        start = false;
        countdown = hours.value = minutes.value = seconds.value = 0;
        clearInterval(syncTimer);
        clearInterval(countdownTimer);
    }
    return {
        hours,
        seconds,
        minutes,
        onFinished: (cb) => (isFinishedCallback = cb),
        setDuration: async () => {
            if (countdown !== 0) {
                throw new Error('setDuration only can execute once after created');
            }
            const duration = await syncDuration();
            if (duration === null) {
                throw new Error('syncDuration failed at start');
            }
            countdown = duration;
            if (duration <= 0) {
                isFinishedCallback?.();
                destroy();
                return;
            }
            start = true;
            syncWithServerService();
            loop();
        },
        reset,
        destroy,
    };
}
