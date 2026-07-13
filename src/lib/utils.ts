import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 Tailwind CSS 类名，处理冲突 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 计算 BMI：体重(kg) / 身高(m)² */
export function calculateBMI(weight: number | null, height: number | null): number | null {
  if (!weight || !height || height <= 0) return null;
  const h = height / 100; // cm → m
  return Math.round((weight / (h * h)) * 10) / 10;
}

/** BMI 分类 */
export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "偏瘦", color: "text-blue-500" };
  if (bmi < 24) return { label: "正常", color: "text-green-500" };
  if (bmi < 28) return { label: "偏胖", color: "text-yellow-500" };
  return { label: "肥胖", color: "text-red-500" };
}

/** 格式化数字，补零 */
export function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

/** 防抖函数 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
