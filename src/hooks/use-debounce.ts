import { useEffect, useRef, useCallback } from "react";

/**
 * 防抖 hook — 延迟执行回调，在 delay 毫秒内无新调用时才触发
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 保持 callback 引用最新
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 清理 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;
}
